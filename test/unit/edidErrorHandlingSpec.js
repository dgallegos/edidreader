'use strict';

/* jasmine specs for EDID error handling and edge cases */

describe('EDID Error Handling and Edge Cases', function() {
  var edid;

  beforeEach(function() {
    edid = new Edid();
  });

  describe('Invalid EDID Headers', function() {
    it('should handle completely invalid header', function() {
      var invalidEdid = [0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF];
      invalidEdid = invalidEdid.concat(new Array(120).fill(0));
      
      edid.setEdidData(invalidEdid);
      expect(function() { edid.parse(); }).not.toThrow();
      expect(edid.validHeader).toBe('ERROR');
    });

    it('should handle partial header data', function() {
      var partialEdid = [0x00, 0xFF, 0xFF];
      
      edid.setEdidData(partialEdid);
      expect(function() { edid.validateHeader(); }).not.toThrow();
      expect(edid.validateHeader()).toBe(false);
    });

    it('should handle empty EDID data', function() {
      edid.setEdidData([]);
      expect(function() { edid.validateHeader(); }).not.toThrow();
      expect(edid.validateHeader()).toBe(false);
    });

    it('should handle null/undefined EDID data', function() {
      edid.setEdidData(null);
      expect(function() { edid.validateHeader(); }).not.toThrow();
      
      edid.setEdidData(undefined);
      expect(function() { edid.validateHeader(); }).not.toThrow();
    });
  });

  describe('Checksum Errors', function() {
    it('should detect incorrect base block checksum', function() {
      var invalidChecksumEdid = EdidTestData.createFullEdidArray(
        EdidTestData.fixChecksums(EdidTestData.basic1080pMonitor)
      );
      invalidChecksumEdid[127] = 0xFF; // Wrong checksum
      
      edid.setEdidData(invalidChecksumEdid);
      expect(edid.validChecksum(0)).toBe(false);
    });

    it('should detect incorrect extension block checksum', function() {
      var testData = EdidTestData.fixChecksums(EdidTestData.basic1080pMonitor);
      testData.block0[126] = 1; // Add extension
      
      var invalidExtension = new Array(128).fill(0);
      invalidExtension[0] = 0x02; // CTA-861
      invalidExtension[127] = 0xFF; // Wrong checksum
      
      var fullEdid = EdidTestData.createFullEdidArray(testData).concat(invalidExtension);
      edid.setEdidData(fullEdid);
      expect(edid.validChecksum(1)).toBe(false);
    });

    it('should handle checksum calculation with edge values', function() {
      var edgeEdid = new Array(128).fill(0xFF); // All 0xFF
      edgeEdid[0] = 0x00; edgeEdid[1] = 0xFF; edgeEdid[2] = 0xFF; edgeEdid[3] = 0xFF;
      edgeEdid[4] = 0xFF; edgeEdid[5] = 0xFF; edgeEdid[6] = 0xFF; edgeEdid[7] = 0x00;
      
      edid.setEdidData(edgeEdid);
      expect(function() { edid.calcChecksum(0); }).not.toThrow();
      expect(typeof edid.calcChecksum(0)).toBe('number');
    });
  });

  describe('Truncated EDID Data', function() {
    it('should handle EDID shorter than 128 bytes', function() {
      var shortEdid = [0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00];
      shortEdid = shortEdid.concat(new Array(50).fill(0)); // Only 58 bytes total
      
      edid.setEdidData(shortEdid);
      expect(function() { edid.parse(); }).not.toThrow();
    });

    it('should handle missing extension blocks', function() {
      var baseEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      baseEdid[126] = 2; // Claims 2 extensions but only provide base block
      
      edid.setEdidData(baseEdid);
      expect(function() { edid.parse(); }).not.toThrow();
      expect(edid.numberOfExtensions).toBe(2);
      // Should create empty extension objects or handle gracefully
    });

    it('should handle partially truncated extension blocks', function() {
      var testData = EdidTestData.fixChecksums(EdidTestData.basic1080pMonitor);
      testData.block0[126] = 1;
      
      var partialExtension = [0x02, 0x03, 0x04, 0x00]; // Only 4 bytes of extension
      var fullEdid = EdidTestData.createFullEdidArray(testData).concat(partialExtension);
      
      edid.setEdidData(fullEdid);
      expect(function() { edid.parse(); }).not.toThrow();
    });
  });

  describe('Invalid Manufacturer IDs', function() {
    it('should handle invalid EISA ID encoding', function() {
      var invalidIdEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
        0x00, 0x00, // Invalid manufacturer ID (all zeros)
      ].concat(new Array(118).fill(0));
      
      edid.setEdidData(invalidIdEdid);
      expect(function() { edid.getEisaId(); }).not.toThrow();
      
      var eisaId = edid.getEisaId();
      expect(typeof eisaId).toBe('string');
      expect(eisaId.length).toBe(3);
    });

    it('should handle manufacturer ID with invalid character mappings', function() {
      var edgeIdEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
        0xFF, 0xFF, // All bits set
      ].concat(new Array(118).fill(0));
      
      edid.setEdidData(edgeIdEdid);
      expect(function() { edid.getEisaId(); }).not.toThrow();
      
      var eisaId = edid.getEisaId();
      expect(eisaId).toBeDefined();
      expect(eisaId.length).toBe(3);
    });
  });

  describe('Invalid Timing Data', function() {
    it('should handle DTD with zero pixel clock', function() {
      var zeroDtdEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      // Set DTD pixel clock to zero
      zeroDtdEdid[54] = 0x00; zeroDtdEdid[55] = 0x00;
      
      edid.setEdidData(zeroDtdEdid);
      expect(function() { edid.parse(); }).not.toThrow();
      
      // Should not include zero pixel clock DTDs
      expect(edid.dtds.length).toBe(0);
    });

    it('should handle DTD with invalid timing values', function() {
      var invalidDtdEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      // Set invalid timing values
      for (var i = 54; i < 72; i++) {
        invalidDtdEdid[i] = 0xFF; // All bits set
      }
      
      edid.setEdidData(invalidDtdEdid);
      expect(function() { edid.parse(); }).not.toThrow();
      
      if (edid.dtds.length > 0) {
        var dtd = edid.dtds[0];
        expect(dtd.pixelClock).toBeGreaterThan(0);
        expect(dtd.horActivePixels).toBeGreaterThan(0);
        expect(dtd.vertActivePixels).toBeGreaterThan(0);
      }
    });

    it('should handle established timings with all bits set', function() {
      var allTimingsEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      // Set all established timing bits
      allTimingsEdid[35] = 0xFF; allTimingsEdid[36] = 0xFF; allTimingsEdid[37] = 0xFF;
      
      edid.setEdidData(allTimingsEdid);
      expect(function() { edid.parse(); }).not.toThrow();
      expect(edid.timingBitmap).toBe(0xFFFFFF);
    });
  });

  describe('CTA Extension Error Handling', function() {
    it('should handle invalid CTA revision numbers', function() {
      var invalidRevEdid = [0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00]
                          .concat(new Array(120).fill(0));
      invalidRevEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0xFF, 0x04, 0x00, // CTA tag with invalid revision 0xFF
      ].concat(new Array(124).fill(0));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension);
      
      edid.setEdidData(invalidRevEdid.concat(ctaExtension));
      expect(function() { edid.parse(); }).not.toThrow();
      expect(edid.exts[0].revisionNumber).toBe(0xFF);
    });

    it('should handle data blocks extending beyond DTD start', function() {
      var overflowEdid = [0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00]
                        .concat(new Array(120).fill(0));
      overflowEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x10, 0xF1,                         // DTD starts at byte 16
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, // Invalid data block data
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, // Extends beyond DTD start
      ].concat(new Array(112).fill(0));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension);
      
      edid.setEdidData(overflowEdid.concat(ctaExtension));
      expect(function() { edid.parse(); }).not.toThrow();
    });

    it('should handle data blocks with invalid lengths', function() {
      var invalidLengthEdid = [0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00]
                             .concat(new Array(120).fill(0));
      invalidLengthEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x20, 0xF1,                         // CTA header
        0x5F, 0x10, 0x04, 0x03, 0x02, 0x01,            // Video block with length 31 (0x1F) - too long
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, // Would overflow
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      ].concat(new Array(96).fill(0));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension);
      
      edid.setEdidData(invalidLengthEdid.concat(ctaExtension));
      expect(function() { edid.parse(); }).not.toThrow();
    });

    it('should handle unknown data block types', function() {
      var unknownBlockEdid = [0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00]
                            .concat(new Array(120).fill(0));
      unknownBlockEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x10, 0xF1,                         // CTA header
        0x67, 0x10, 0x04, 0x03, 0x02, 0x01,            // Unknown data block type 6 (reserved)
        0xF8, 0xFF, 0xFF, 0xFF, 0xFF,                   // Invalid extended tag block
      ].concat(new Array(115).fill(0));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension);
      
      edid.setEdidData(unknownBlockEdid.concat(ctaExtension));
      expect(function() { edid.parse(); }).not.toThrow();
      
      // Should create data block collection but handle unknown types gracefully
      expect(edid.exts[0].dataBlockCollection).toBeDefined();
    });
  });

  describe('HDMI VSDB Error Handling', function() {
    it('should handle HDMI VSDB with insufficient data', function() {
      var shortHdmiEdid = [0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00]
                         .concat(new Array(120).fill(0));
      shortHdmiEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x0C, 0xF1,                         // CTA header
        0x65, 0x03, 0x0C, 0x00, 0x10,                   // HDMI VSDB with only 5 bytes (truncated)
      ].concat(new Array(119).fill(0));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension);
      
      edid.setEdidData(shortHdmiEdid.concat(ctaExtension));
      expect(function() { edid.parse(); }).not.toThrow();
      
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0x000C03) {
          hdmiBlock = block;
          break;
        }
      }
      
      expect(hdmiBlock).not.toBeNull();
      expect(hdmiBlock.ieeeIdentifier).toBe(0x000C03);
      // Should handle gracefully even with insufficient data
    });

    it('should handle unknown IEEE OUI values', function() {
      var unknownOuiEdid = [0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00]
                          .concat(new Array(120).fill(0));
      unknownOuiEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x10, 0xF1,                         // CTA header
        0x68, 0xAA, 0xBB, 0xCC, 0x01, 0x02, 0x03, 0x04, // Unknown IEEE OUI 0xCCBBAA
        0x05, 0x06, 0x07, 0x08,
      ].concat(new Array(116).fill(0));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension);
      
      edid.setEdidData(unknownOuiEdid.concat(ctaExtension));
      expect(function() { edid.parse(); }).not.toThrow();
      
      var unknownBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xCCBBAA) {
          unknownBlock = block;
          break;
        }
      }
      
      expect(unknownBlock).not.toBeNull();
      expect(unknownBlock.ieeeIdentifier).toBe(0xCCBBAA);
    });
  });

  describe('Maximum EDID Size Handling', function() {
    it('should handle maximum 256 block EDID', function() {
      var maxEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      maxEdid[126] = 255; // Maximum extensions
      
      // Add only a few extensions for testing (not all 255)
      for (var i = 0; i < 3; i++) {
        var extension = new Array(128).fill(0);
        extension[0] = 0x02; // CTA tag
        extension[127] = EdidTestData.calculateChecksum(extension);
        maxEdid = maxEdid.concat(extension);
      }
      
      edid.setEdidData(maxEdid);
      expect(function() { edid.parse(); }).not.toThrow();
      expect(edid.numberOfExtensions).toBe(255);
    });

    it('should handle block map extensions', function() {
      var blockMapEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      blockMapEdid[126] = 1;
      
      // Block map extension (tag 0xF0)
      var blockMapExtension = [0xF0].concat(new Array(127).fill(0));
      blockMapExtension[127] = EdidTestData.calculateChecksum(blockMapExtension);
      
      edid.setEdidData(blockMapEdid.concat(blockMapExtension));
      expect(function() { edid.parse(); }).not.toThrow();
      expect(edid.exts[0].extTag).toBe(0xF0);
    });
  });

  describe('Memory and Performance Edge Cases', function() {
    it('should handle very large EDID data arrays', function() {
      var largeEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      
      // Add many extensions (simulate large multi-block EDID)
      for (var i = 0; i < 10; i++) {
        var extension = new Array(128).fill(i % 256);
        extension[0] = 0x02; // CTA tag
        extension[127] = EdidTestData.calculateChecksum(extension);
        largeEdid = largeEdid.concat(extension);
      }
      
      expect(function() { 
        edid.setEdidData(largeEdid);
        edid.parse();
      }).not.toThrow();
    });

    it('should handle repeated parsing calls', function() {
      var testData = EdidTestData.fixChecksums(EdidTestData.samsungQ800T_HDMI21);
      edid.setEdidData(EdidTestData.createFullEdidArray(testData));
      
      // Parse multiple times
      expect(function() {
        for (var i = 0; i < 100; i++) {
          edid.parse();
        }
      }).not.toThrow();
      
      // Results should be consistent
      expect(edid.eisaId).toBe('SAM');
      expect(edid.numberOfExtensions).toBe(1);
    });

    it('should handle EDID data modification after parsing', function() {
      var testData = EdidTestData.fixChecksums(EdidTestData.basic1080pMonitor);
      var edidData = EdidTestData.createFullEdidArray(testData);
      
      edid.setEdidData(edidData);
      edid.parse();
      
      var originalEisa = edid.eisaId;
      
      // Modify the underlying data
      edidData[8] = 0xFF; edidData[9] = 0xFF;
      
      // Re-parse should reflect changes
      edid.parse();
      expect(edid.eisaId).not.toBe(originalEisa);
    });
  });

  describe('Boundary Value Testing', function() {
    it('should handle minimum valid EDID', function() {
      var minimalEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, // Minimal vendor/product info
        0x01, 0x01, 0x01, 0x03,                         // Week 1, year 1, EDID 1.3
      ].concat(new Array(108).fill(0));
      minimalEdid[126] = 0; // No extensions
      minimalEdid[127] = EdidTestData.calculateChecksum(minimalEdid);
      
      edid.setEdidData(minimalEdid);
      expect(function() { edid.parse(); }).not.toThrow();
      expect(edid.validHeader).toBe('OK');
      expect(edid.numberOfExtensions).toBe(0);
    });

    it('should handle extreme chromaticity values', function() {
      var extremeChromEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      // Set extreme chromaticity values
      for (var i = 25; i <= 34; i++) {
        extremeChromEdid[i] = 0xFF;
      }
      extremeChromEdid[127] = EdidTestData.calculateChecksum(extremeChromEdid.slice(0, 127));
      
      edid.setEdidData(extremeChromEdid);
      expect(function() { edid.parse(); }).not.toThrow();
      
      var chrom = edid.chromaticity;
      expect(chrom.redXCoords).toBeGreaterThanOrEqual(0);
      expect(chrom.redXCoords).toBeLessThanOrEqual(1);
      expect(chrom.redYCoords).toBeGreaterThanOrEqual(0);
      expect(chrom.redYCoords).toBeLessThanOrEqual(1);
    });

    it('should handle extreme timing values', function() {
      var extremeTimingEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      // Set extreme pixel clock
      extremeTimingEdid[54] = 0xFF; extremeTimingEdid[55] = 0xFF;
      extremeTimingEdid[127] = EdidTestData.calculateChecksum(extremeTimingEdid.slice(0, 127));
      
      edid.setEdidData(extremeTimingEdid);
      expect(function() { edid.parse(); }).not.toThrow();
      
      if (edid.dtds.length > 0) {
        expect(edid.dtds[0].pixelClock).toBe(655.35); // (0xFFFF / 100)
      }
    });
  });
});