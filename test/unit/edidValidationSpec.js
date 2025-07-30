'use strict';

/* jasmine specs for EDID parser validation and edge cases */

describe('EDID Parser Validation and Edge Cases', function() {
  var edid;

  beforeEach(function() {
    edid = new Edid();
  });

  describe('Header Validation Edge Cases', function() {
    it('should handle partial headers gracefully', function() {
      var partialHeader = [0x00, 0xFF, 0xFF];
      edid.setEdidData(partialHeader);
      expect(edid.validateHeader()).toBe(false);
    });

    it('should reject corrupted header patterns', function() {
      var corruptedHeaders = [
        [0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00],
        [0x00, 0xFE, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00],
        [0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x01]
      ];
      
      for (var i = 0; i < corruptedHeaders.length; i++) {
        edid.setEdidData(corruptedHeaders[i].concat(new Array(120).fill(0)));
        expect(edid.validateHeader()).toBe(false);
      }
    });

    it('should handle empty EDID data', function() {
      edid.setEdidData([]);
      expect(edid.validateHeader()).toBe(false);
    });
  });

  describe('Checksum Validation Edge Cases', function() {
    it('should detect single-bit checksum errors', function() {
      var baseEdid = new Array(128).fill(0);
      baseEdid[0] = 0x00; baseEdid[1] = 0xFF; baseEdid[2] = 0xFF; baseEdid[3] = 0xFF;
      baseEdid[4] = 0xFF; baseEdid[5] = 0xFF; baseEdid[6] = 0xFF; baseEdid[7] = 0x00;
      
      // Calculate correct checksum
      var sum = 0;
      for (var i = 0; i < 127; i++) {
        sum += baseEdid[i];
      }
      baseEdid[127] = (256 - (sum % 256)) % 256;
      
      edid.setEdidData(baseEdid);
      expect(edid.validChecksum(0)).toBe(true);
      
      // Introduce single-bit error
      baseEdid[127] ^= 0x01;
      edid.setEdidData(baseEdid);
      expect(edid.validChecksum(0)).toBe(false);
    });

    it('should handle multiple block checksum validation', function() {
      var block0 = new Array(128).fill(0);
      block0[0] = 0x00; block0[1] = 0xFF; block0[2] = 0xFF; block0[3] = 0xFF;
      block0[4] = 0xFF; block0[5] = 0xFF; block0[6] = 0xFF; block0[7] = 0x00;
      block0[126] = 1; // 1 extension
      
      var block1 = new Array(128).fill(0);
      block1[0] = 0x02; // CTA extension tag
      
      // Fix checksums
      block0[127] = EdidTestData.calculateChecksum(block0);
      block1[127] = EdidTestData.calculateChecksum(block1);
      
      edid.setEdidData(block0.concat(block1));
      expect(edid.validChecksum(0)).toBe(true);
      expect(edid.validChecksum(1)).toBe(true);
    });
  });

  describe('Extension Block Edge Cases', function() {
    it('should handle missing extension blocks gracefully', function() {
      var baseEdid = new Array(128).fill(0);
      baseEdid[0] = 0x00; baseEdid[1] = 0xFF; baseEdid[2] = 0xFF; baseEdid[3] = 0xFF;
      baseEdid[4] = 0xFF; baseEdid[5] = 0xFF; baseEdid[6] = 0xFF; baseEdid[7] = 0x00;
      baseEdid[126] = 2; // Claims 2 extensions but only provide block 0
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      
      edid.setEdidData(baseEdid);
      expect(function() {
        edid.parse();
      }).not.toThrow();
      
      expect(edid.numberOfExtensions).toBe(2);
    });

    it('should handle unknown extension tags', function() {
      var baseEdid = new Array(128).fill(0);
      baseEdid[0] = 0x00; baseEdid[1] = 0xFF; baseEdid[2] = 0xFF; baseEdid[3] = 0xFF;
      baseEdid[4] = 0xFF; baseEdid[5] = 0xFF; baseEdid[6] = 0xFF; baseEdid[7] = 0x00;
      baseEdid[126] = 1; // 1 extension
      
      var unknownExt = new Array(128).fill(0);
      unknownExt[0] = 0xFF; // Unknown extension tag
      
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      unknownExt[127] = EdidTestData.calculateChecksum(unknownExt);
      
      edid.setEdidData(baseEdid.concat(unknownExt));
      expect(function() {
        edid.parse();
      }).not.toThrow();
    });
  });

  describe('CTA Data Block Edge Cases', function() {
    it('should handle zero-length data blocks', function() {
      var baseEdid = new Array(128).fill(0);
      baseEdid[0] = 0x00; baseEdid[1] = 0xFF; baseEdid[2] = 0xFF; baseEdid[3] = 0xFF;
      baseEdid[4] = 0xFF; baseEdid[5] = 0xFF; baseEdid[6] = 0xFF; baseEdid[7] = 0x00;
      baseEdid[126] = 1;
      
      var ctaExt = new Array(128).fill(0);
      ctaExt[0] = 0x02; // CTA tag
      ctaExt[1] = 0x03; // Revision
      ctaExt[2] = 0x08; // DTD start
      ctaExt[3] = 0x00; // No support flags
      ctaExt[4] = 0x40; // Zero-length video data block (tag 2, length 0)
      ctaExt[5] = 0x20; // Zero-length audio data block (tag 1, length 0)
      
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      ctaExt[127] = EdidTestData.calculateChecksum(ctaExt);
      
      edid.setEdidData(baseEdid.concat(ctaExt));
      expect(function() {
        edid.parse();
      }).not.toThrow();
    });

    it('should handle truncated data blocks', function() {
      var baseEdid = new Array(128).fill(0);
      baseEdid[0] = 0x00; baseEdid[1] = 0xFF; baseEdid[2] = 0xFF; baseEdid[3] = 0xFF;
      baseEdid[4] = 0xFF; baseEdid[5] = 0xFF; baseEdid[6] = 0xFF; baseEdid[7] = 0x00;
      baseEdid[126] = 1;
      
      var ctaExt = new Array(128).fill(0);
      ctaExt[0] = 0x02; // CTA tag
      ctaExt[1] = 0x03; // Revision
      ctaExt[2] = 0x08; // DTD start
      ctaExt[3] = 0x00; // No support flags
      ctaExt[4] = 0x48; // Video data block claiming length 8 but truncated
      ctaExt[5] = 0x01; // Only 1 byte of data
      // Block ends abruptly
      
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      ctaExt[127] = EdidTestData.calculateChecksum(ctaExt);
      
      edid.setEdidData(baseEdid.concat(ctaExt));
      expect(function() {
        edid.parse();
      }).not.toThrow();
    });

    it('should handle malformed extended tag blocks', function() {
      var baseEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      baseEdid[126] = 1;
      
      var ctaExt = new Array(128).fill(0);
      ctaExt[0] = 0x02; // CTA tag
      ctaExt[1] = 0x03; // Revision
      ctaExt[2] = 0x0C; // DTD start
      ctaExt[3] = 0x00; // No support flags
      ctaExt[4] = 0x78; // Extended tag block, length 8
      ctaExt[5] = 0xFF; // Invalid extended tag
      // Missing extended tag data
      
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      ctaExt[127] = EdidTestData.calculateChecksum(ctaExt);
      
      edid.setEdidData(baseEdid.concat(ctaExt));
      expect(function() {
        edid.parse();
      }).not.toThrow();
    });
  });

  describe('VIC Code Edge Cases', function() {
    it('should handle invalid VIC codes gracefully', function() {
      var baseEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      baseEdid[126] = 1;
      
      var ctaExt = new Array(128).fill(0);
      ctaExt[0] = 0x02; // CTA tag
      ctaExt[1] = 0x03; // Revision
      ctaExt[2] = 0x0C; // DTD start
      ctaExt[3] = 0x00; // No support flags
      ctaExt[4] = 0x46; // Video data block, length 6
      ctaExt[5] = 0x00; // Invalid VIC 0
      ctaExt[6] = 0xFF; // Invalid VIC 255
      ctaExt[7] = 0x80; // VIC 0 with native flag
      ctaExt[8] = 0x01; // Valid VIC 1
      ctaExt[9] = 0x81; // Valid VIC 1 with native flag
      ctaExt[10] = 0x7F; // Valid VIC 127
      
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      ctaExt[127] = EdidTestData.calculateChecksum(ctaExt);
      
      edid.setEdidData(baseEdid.concat(ctaExt));
      expect(function() {
        edid.parse();
      }).not.toThrow();
      
      edid.parse();
      var videoBlock = edid.exts[0].dataBlockCollection[0];
      expect(videoBlock.shortVideoDescriptors.length).toBeGreaterThan(0);
    });

    it('should handle extended VIC range correctly', function() {
      var baseEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      baseEdid[126] = 1;
      
      var ctaExt = new Array(128).fill(0);
      ctaExt[0] = 0x02; // CTA tag
      ctaExt[1] = 0x03; // Revision
      ctaExt[2] = 0x0E; // DTD start
      ctaExt[3] = 0x00; // No support flags
      ctaExt[4] = 0x48; // Video data block, length 8
      ctaExt[5] = 0x01; // VIC 1
      ctaExt[6] = 0x6F; // VIC 111 (standard range)
      ctaExt[7] = 0xC0; // VIC 192 (extended range, bit 6 set)
      ctaExt[8] = 0xDB; // VIC 219 (8K@100Hz, extended range)
      ctaExt[9] = 0x04; // VIC 4
      ctaExt[10] = 0x03; // VIC 3
      ctaExt[11] = 0x02; // VIC 2
      ctaExt[12] = 0x01; // VIC 1
      
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      ctaExt[127] = EdidTestData.calculateChecksum(ctaExt);
      
      edid.setEdidData(baseEdid.concat(ctaExt));
      expect(function() {
        edid.parse();
      }).not.toThrow();
      
      edid.parse();
      var videoBlock = edid.exts[0].dataBlockCollection[0];
      
      // Should parse extended VIC codes correctly
      var foundHighVIC = false;
      for (var i = 0; i < videoBlock.shortVideoDescriptors.length; i++) {
        if (videoBlock.shortVideoDescriptors[i].vic >= 192) {
          foundHighVIC = true;
          break;
        }
      }
      expect(foundHighVIC).toBe(true);
    });
  });

  describe('HDMI VSDB Edge Cases', function() {
    it('should handle truncated HDMI VSDB', function() {
      var baseEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      baseEdid[126] = 1;
      
      var ctaExt = new Array(128).fill(0);
      ctaExt[0] = 0x02; // CTA tag
      ctaExt[1] = 0x03; // Revision
      ctaExt[2] = 0x0A; // DTD start
      ctaExt[3] = 0x00; // No support flags
      ctaExt[4] = 0x64; // VSDB length 4
      ctaExt[5] = 0x03; // IEEE OUI byte 0 (HDMI)
      ctaExt[6] = 0x0C; // IEEE OUI byte 1
      ctaExt[7] = 0x00; // IEEE OUI byte 2
      // Missing physical address and other HDMI data
      
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      ctaExt[127] = EdidTestData.calculateChecksum(ctaExt);
      
      edid.setEdidData(baseEdid.concat(ctaExt));
      expect(function() {
        edid.parse();
      }).not.toThrow();
      
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0x000C03) {
          hdmiBlock = block;
          break;
        }
      }
      expect(hdmiBlock).not.toBeNull();
    });

    it('should handle unknown vendor VSDBs', function() {
      var baseEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      baseEdid[126] = 1;
      
      var ctaExt = new Array(128).fill(0);
      ctaExt[0] = 0x02; // CTA tag
      ctaExt[1] = 0x03; // Revision
      ctaExt[2] = 0x0C; // DTD start
      ctaExt[3] = 0x00; // No support flags
      ctaExt[4] = 0x66; // VSDB length 6
      ctaExt[5] = 0x12; // Unknown IEEE OUI
      ctaExt[6] = 0x34; 
      ctaExt[7] = 0x56;
      ctaExt[8] = 0xAB; // Vendor-specific data
      ctaExt[9] = 0xCD;
      ctaExt[10] = 0xEF;
      
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      ctaExt[127] = EdidTestData.calculateChecksum(ctaExt);
      
      edid.setEdidData(baseEdid.concat(ctaExt));
      expect(function() {
        edid.parse();
      }).not.toThrow();
      
      edid.parse();
      var unknownVSDB = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0x563412) {
          unknownVSDB = block;
          break;
        }
      }
      expect(unknownVSDB).not.toBeNull();
    });
  });

  describe('Memory Safety and Bounds Checking', function() {
    it('should handle extremely large EDID claims safely', function() {
      var baseEdid = new Array(128).fill(0);
      baseEdid[0] = 0x00; baseEdid[1] = 0xFF; baseEdid[2] = 0xFF; baseEdid[3] = 0xFF;
      baseEdid[4] = 0xFF; baseEdid[5] = 0xFF; baseEdid[6] = 0xFF; baseEdid[7] = 0x00;
      baseEdid[126] = 255; // Claims 255 extensions (impossible)
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      
      edid.setEdidData(baseEdid);
      expect(function() {
        edid.parse();
      }).not.toThrow();
    });

    it('should handle data block length overruns', function() {
      var baseEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      baseEdid[126] = 1;
      
      var ctaExt = new Array(128).fill(0);
      ctaExt[0] = 0x02; // CTA tag
      ctaExt[1] = 0x03; // Revision
      ctaExt[2] = 0x06; // DTD start
      ctaExt[3] = 0x00; // No support flags
      ctaExt[4] = 0x7F; // Data block claiming length 31 (would overrun)
      // Only room for 1 byte before DTD start
      
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      ctaExt[127] = EdidTestData.calculateChecksum(ctaExt);
      
      edid.setEdidData(baseEdid.concat(ctaExt));
      expect(function() {
        edid.parse();
      }).not.toThrow();
    });
  });

  describe('Real-World Corrupted EDID Handling', function() {
    it('should handle EDIDs with flipped bits', function() {
      var samsungData = EdidTestData.fixChecksums(EdidTestData.samsungQ800T_HDMI21);
      var edidArray = EdidTestData.createFullEdidArray(samsungData);
      
      // Introduce random bit flips
      edidArray[50] ^= 0x01; // Flip bit in chromaticity data
      edidArray[150] ^= 0x80; // Flip bit in CTA extension
      
      edid.setEdidData(edidArray);
      expect(function() {
        edid.parse();
      }).not.toThrow();
    });

    it('should handle EDIDs with swapped bytes', function() {
      var lgData = EdidTestData.fixChecksums(EdidTestData.lgC9_OLED_HDMI21);
      var edidArray = EdidTestData.createFullEdidArray(lgData);
      
      // Swap some bytes (simulate transmission errors)
      var temp = edidArray[20];
      edidArray[20] = edidArray[21];
      edidArray[21] = temp;
      
      edid.setEdidData(edidArray);
      expect(function() {
        edid.parse();
      }).not.toThrow();
    });

    it('should provide meaningful error information for corrupted EDIDs', function() {
      var corruptedEdid = new Array(256).fill(0xFF); // All 0xFF bytes
      
      edid.setEdidData(corruptedEdid);
      expect(edid.validateHeader()).toBe(false);
      
      // Should still attempt to parse without crashing
      expect(function() {
        edid.parse();
      }).not.toThrow();
    });
  });

  describe('Performance Edge Cases', function() {
    it('should handle large numbers of data blocks efficiently', function() {
      var baseEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      baseEdid[126] = 1;
      
      var ctaExt = new Array(128).fill(0);
      ctaExt[0] = 0x02; // CTA tag
      ctaExt[1] = 0x03; // Revision
      ctaExt[2] = 0x80; // DTD start (fill most of block with data blocks)
      ctaExt[3] = 0x00; // No support flags
      
      // Fill with many small data blocks
      var offset = 4;
      while (offset < 120) {
        ctaExt[offset] = 0x60 + (offset % 7); // Various data block types, length 0
        offset++;
      }
      
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      ctaExt[127] = EdidTestData.calculateChecksum(ctaExt);
      
      var startTime = new Date().getTime();
      edid.setEdidData(baseEdid.concat(ctaExt));
      edid.parse();
      var endTime = new Date().getTime();
      
      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle recursive data structures safely', function() {
      // Create EDID that might cause infinite loops if parsed incorrectly
      var baseEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      baseEdid[126] = 1;
      
      var ctaExt = new Array(128).fill(0);
      ctaExt[0] = 0x02; // CTA tag
      ctaExt[1] = 0x03; // Revision
      ctaExt[2] = 0x08; // DTD start
      ctaExt[3] = 0x00; // No support flags
      ctaExt[4] = 0x62; // VSDB length 2
      ctaExt[5] = 0x05; // Fake IEEE OUI that points back to earlier data
      ctaExt[6] = 0x04; // Could create circular reference
      
      baseEdid[127] = EdidTestData.calculateChecksum(baseEdid);
      ctaExt[127] = EdidTestData.calculateChecksum(ctaExt);
      
      var startTime = new Date().getTime();
      edid.setEdidData(baseEdid.concat(ctaExt));
      expect(function() {
        edid.parse();
      }).not.toThrow();
      var endTime = new Date().getTime();
      
      // Should not hang or take excessive time
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});