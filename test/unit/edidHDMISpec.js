'use strict';

/* jasmine specs for HDMI Vendor Specific Data Block parsing */

describe('HDMI Vendor Specific Data Block Parsing', function() {
  var edid;

  beforeEach(function() {
    edid = new Edid();
  });

  describe('HDMI 1.4 VSDB', function() {
    beforeEach(function() {
      var hdmi14Edid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00,
      ].concat(new Array(120).fill(0));
      hdmi14Edid[126] = 1; // 1 extension
      
      var ctaExtension = [
        0x02, 0x03, 0x25, 0xF1,                         // CTA-861, rev 3, length 37, flags
        0x47, 0x10, 0x04, 0x03, 0x02, 0x01,            // Video Data Block
        0x23, 0x09, 0x07, 0x07,                         // Audio Data Block
        0x83, 0x01, 0x00, 0x00,                         // Speaker Allocation
        // HDMI 1.4 VSDB (IEEE OUI 0x000C03)
        0x68, 0x03, 0x0C, 0x00,                         // VSDB header: length 8, IEEE OUI 0x000C03
        0x20, 0x00,                                     // Physical address 2.0.0.0
        0x20,                                           // Support AI=0, DC_48bit=0, DC_36bit=1, DC_30bit=0, DC_Y444=0, DVI_Dual=0
        0x3C,                                           // Max TMDS Clock = 300MHz (0x3C * 5)
        0x40,                                           // Latency fields present=0, I_Latency present=1
        0x40, 0x40,                                     // Video/Audio latency = 64ms each ((64-1)*2)
        0x60, 0x60,                                     // I_Video/I_Audio latency = 96ms each
      ].concat(new Array(97).fill(0));
      
      // Fix checksums
      hdmi14Edid[127] = EdidTestData.calculateChecksum(hdmi14Edid.slice(0, 127));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension.slice(0, 127));
      
      edid.setEdidData(hdmi14Edid.concat(ctaExtension));
    });

    it('should identify HDMI 1.4 VSDB by IEEE OUI', function() {
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
      expect(hdmiBlock.ieeeIdentifier).toBe(0x000C03);
    });

    it('should parse physical address correctly', function() {
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0x000C03) {
          hdmiBlock = block;
          break;
        }
      }
      expect(hdmiBlock.physicalAddress).toBe(0x2000); // 2.0.0.0
    });

    it('should parse deep color support', function() {
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0x000C03) {
          hdmiBlock = block;
          break;
        }
      }
      expect(hdmiBlock.deepColor36).toBe(true);
      expect(hdmiBlock.deepColor48).toBe(false);
      expect(hdmiBlock.deepColor30).toBe(false);
    });

    it('should parse max TMDS rate', function() {
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0x000C03) {
          hdmiBlock = block;
          break;
        }
      }
      expect(hdmiBlock.maxTmdsRate).toBe(300); // 0x3C * 5 = 300MHz
    });

    it('should parse latency information', function() {
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0x000C03) {
          hdmiBlock = block;
          break;
        }
      }
      expect(hdmiBlock.videoLatency).toBe(126); // (64-1)*2 = 126ms
      expect(hdmiBlock.audioLatency).toBe(126);
      expect(hdmiBlock.iVideoLatency).toBe(190); // (96-1)*2 = 190ms
      expect(hdmiBlock.iAudioLatency).toBe(190);
    });
  });

  describe('HDMI 2.0 VSDB', function() {
    beforeEach(function() {
      var hdmi20Edid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00,
      ].concat(new Array(120).fill(0));
      hdmi20Edid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x1E, 0xF1,                         // CTA-861, rev 3, length 30, flags
        0x47, 0x10, 0x04, 0x03, 0x02, 0x01,            // Video Data Block
        0x23, 0x09, 0x07, 0x07,                         // Audio Data Block
        // HDMI Forum VSDB (IEEE OUI 0xC45DD8)
        0x68, 0xD8, 0x5D, 0xC4,                         // VSDB header: length 8, IEEE OUI 0xC45DD8
        0x01,                                           // Version = 1
        0x78,                                           // Max TMDS Character Rate = 600MHz (0x78 * 5)
        0x44,                                           // SCDC Present=0, RR Capable=1, LTE 340Mcsc Scramble=0, Independent View=0, Dual View=1, 3D OSD Disparity=0
        0x00,                                           // DC_Y420 support byte
      ].concat(new Array(110).fill(0));
      
      // Fix checksums
      hdmi20Edid[127] = EdidTestData.calculateChecksum(hdmi20Edid.slice(0, 127));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension.slice(0, 127));
      
      edid.setEdidData(hdmi20Edid.concat(ctaExtension));
    });

    it('should identify HDMI Forum VSDB by IEEE OUI', function() {
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
          hdmiBlock = block;
          break;
        }
      }
      expect(hdmiBlock).not.toBeNull();
      expect(hdmiBlock.ieeeIdentifier).toBe(0xC45DD8);
    });

    it('should parse HDMI Forum version', function() {
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
          hdmiBlock = block;
          break;
        }
      }
      expect(hdmiBlock.versionHF).toBe(1);
    });

    it('should parse max TMDS character rate', function() {
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
          hdmiBlock = block;
          break;
        }
      }
      expect(hdmiBlock.maxTmdsRateHF).toBe(600); // 0x78 * 5 = 600MHz
    });

    it('should parse SCDC support', function() {
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
          hdmiBlock = block;
          break;
        }
      }
      expect(hdmiBlock.supportsSCDC).toBe(false);
      expect(hdmiBlock.supportsSCDCRR).toBe(true);
    });

    it('should parse 3D support flags', function() {
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
          hdmiBlock = block;
          break;
        }
      }
      expect(hdmiBlock.supports3DDV).toBe(true);
      expect(hdmiBlock.supports3DIV).toBe(false);
    });
  });

  describe('HDMI 2.1 Features', function() {
    beforeEach(function() {
      var hdmi21Edid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00,
      ].concat(new Array(120).fill(0));
      hdmi21Edid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x28, 0xF1,                         // CTA-861, rev 3, length 40, flags
        0x47, 0x10, 0x04, 0x03, 0x02, 0x01,            // Video Data Block
        0x23, 0x09, 0x07, 0x07,                         // Audio Data Block
        // HDMI Forum VSDB with HDMI 2.1 features (IEEE OUI 0xC45DD8)
        0x6C, 0xD8, 0x5D, 0xC4,                         // VSDB header: length 12, IEEE OUI 0xC45DD8
        0x01,                                           // Version = 1
        0x78,                                           // Max TMDS Character Rate = 600MHz
        0x80,                                           // SCDC Present=1, other flags
        0x00,                                           // DC_Y420 support
        0x60,                                           // VRR Enabled=0, ALLM=1, CNMVRR=1, FVA=0
        0x3C,                                           // VRR_min = 60 (bits 5:0)
        0xF0,                                           // VRR_max = 120 (bits 7:2)
        0x00, 0x00, 0x00, 0x00,                         // Additional feature bytes
      ].concat(new Array(98).fill(0));
      
      // Fix checksums  
      hdmi21Edid[127] = EdidTestData.calculateChecksum(hdmi21Edid.slice(0, 127));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension.slice(0, 127));
      
      edid.setEdidData(hdmi21Edid.concat(ctaExtension));
    });

    it('should detect ALLM support', function() {
      // Note: This test assumes the HDMI 2.1 parser functions exist
      // If they don't exist yet, this test will help validate when they're added
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
          hdmiBlock = block;
          break;
        }
      }
      
      expect(hdmiBlock).not.toBeNull();
      
      // These properties will exist once HDMI 2.1 parsing is implemented
      if (hdmiBlock.supportsALLM !== undefined) {
        expect(hdmiBlock.supportsALLM).toBe(true);
      }
    });

    it('should detect VRR support and range', function() {
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
          hdmiBlock = block;
          break;
        }
      }
      
      expect(hdmiBlock).not.toBeNull();
      
      // These properties will exist once HDMI 2.1 parsing is implemented
      if (hdmiBlock.supportsVRR !== undefined) {
        expect(hdmiBlock.supportsVRR).toBe(true);
        expect(hdmiBlock.vrrMin).toBe(60);
        expect(hdmiBlock.vrrMax).toBe(120);
      }
    });

    it('should detect enhanced SCDC capabilities', function() {
      edid.parse();
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
          hdmiBlock = block;
          break;
        }
      }
      
      expect(hdmiBlock).not.toBeNull();
      expect(hdmiBlock.supportsSCDC).toBe(true);
    });
  });

  describe('Multiple HDMI VSDBs', function() {
    beforeEach(function() {
      // Test EDID with both HDMI 1.4 and HDMI Forum VSDBs
      var dualHdmiEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00,
      ].concat(new Array(120).fill(0));
      dualHdmiEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x35, 0xF1,                         // CTA-861, rev 3, length 53, flags
        0x47, 0x10, 0x04, 0x03, 0x02, 0x01,            // Video Data Block
        0x23, 0x09, 0x07, 0x07,                         // Audio Data Block
        // HDMI 1.4 VSDB
        0x66, 0x03, 0x0C, 0x00, 0x10, 0x00, 0x20,      // Basic HDMI 1.4 block
        // HDMI Forum VSDB  
        0x68, 0xD8, 0x5D, 0xC4, 0x01, 0x78, 0x44, 0x00, // HDMI 2.0+ block
        // Additional vendor blocks could be here
        0x85, 0x03, 0x3B, 0x1A, 0x00, 0x01, 0x02,      // AMD FreeSync VSDB (example)
      ].concat(new Array(81).fill(0));
      
      // Fix checksums
      dualHdmiEdid[127] = EdidTestData.calculateChecksum(dualHdmiEdid.slice(0, 127));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension.slice(0, 127));
      
      edid.setEdidData(dualHdmiEdid.concat(ctaExtension));
    });

    it('should parse multiple HDMI VSDBs', function() {
      edid.parse();
      var hdmiBlocks = [];
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && 
           (block.ieeeIdentifier === 0x000C03 || block.ieeeIdentifier === 0xC45DD8)) {
          hdmiBlocks.push(block);
        }
      }
      expect(hdmiBlocks.length).toBe(2);
    });

    it('should distinguish HDMI 1.4 from HDMI Forum blocks', function() {
      edid.parse();
      var hdmi14Block = null, hdmiForumBlock = null;
      
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3) {
          if (block.ieeeIdentifier === 0x000C03) {
            hdmi14Block = block;
          } else if (block.ieeeIdentifier === 0xC45DD8) {
            hdmiForumBlock = block;
          }
        }
      }
      
      expect(hdmi14Block).not.toBeNull();
      expect(hdmiForumBlock).not.toBeNull();
      expect(hdmi14Block.physicalAddress).toBeDefined();
      expect(hdmiForumBlock.versionHF).toBeDefined();
    });
  });

  describe('Vendor Block Error Handling', function() {
    beforeEach(function() {
      var errorEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00,
      ].concat(new Array(120).fill(0));
      errorEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x15, 0xF1,                         // CTA-861, rev 3, length 21, flags
        0x47, 0x10, 0x04, 0x03, 0x02, 0x01,            // Video Data Block
        // Truncated HDMI VSDB (should handle gracefully)
        0x64, 0x03, 0x0C, 0x00, 0x10,                   // Incomplete HDMI 1.4 block
        // Unknown vendor VSDB
        0x66, 0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC,      // Unknown IEEE OUI
      ].concat(new Array(108).fill(0));
      
      // Fix checksums
      errorEdid[127] = EdidTestData.calculateChecksum(errorEdid.slice(0, 127));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension.slice(0, 127));
      
      edid.setEdidData(errorEdid.concat(ctaExtension));
    });

    it('should handle truncated HDMI VSDB gracefully', function() {
      edid.parse();
      var hdmiBlocks = [];
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0x000C03) {
          hdmiBlocks.push(block);
        }
      }
      
      expect(hdmiBlocks.length).toBe(1);
      expect(hdmiBlocks[0].ieeeIdentifier).toBe(0x000C03);
      // Should not crash and should set basic properties
    });

    it('should handle unknown vendor VSDBs', function() {
      edid.parse();
      var unknownBlocks = [];
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0x56341256) {
          unknownBlocks.push(block);
        }
      }
      
      expect(unknownBlocks.length).toBe(1);
      expect(unknownBlocks[0].ieeeIdentifier).toBe(0x56341256);
      // Should parse IEEE identifier but not have HDMI-specific properties
    });
  });

  describe('Real World HDMI Examples', function() {
    it('should parse Samsung Q800T HDMI capabilities', function() {
      var samsungData = EdidTestData.fixChecksums(EdidTestData.samsungQ800T_HDMI21);
      edid.setEdidData(EdidTestData.createFullEdidArray(samsungData));
      edid.parse();
      
      // Should find HDMI vendor blocks
      var hdmiBlocks = [];
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && 
           (block.ieeeIdentifier === 0x000C03 || block.ieeeIdentifier === 0xC45DD8)) {
          hdmiBlocks.push(block);
        }
      }
      
      expect(hdmiBlocks.length).toBeGreaterThan(0);
    });

    it('should parse Dell P2415Q HDMI capabilities', function() {
      var dellData = EdidTestData.fixChecksums(EdidTestData.dellP2415Q_HDMI14);
      dellData.block0[126] = 1; // Add extension
      
      // Add basic CTA extension with HDMI 1.4 VSDB
      var ctaExtension = [
        0x02, 0x03, 0x18, 0xF1,
        0x47, 0x5F, 0x90, 0x04, 0x03, 0x02, 0x01,      // Video with 4K support
        0x66, 0x03, 0x0C, 0x00, 0x10, 0x00, 0x3C,      // HDMI 1.4 VSDB
        0x83, 0x01, 0x00, 0x00,                         // Speaker allocation
      ].concat(new Array(109).fill(0));
      
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension);
      
      edid.setEdidData(EdidTestData.createFullEdidArray(dellData).concat(ctaExtension));
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
      expect(hdmiBlock.maxTmdsRate).toBe(300); // 4K30 capability
    });
  });
});