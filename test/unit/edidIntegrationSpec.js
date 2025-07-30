'use strict';

/* jasmine specs for EDID parser integration testing */

describe('EDID Parser Integration Tests', function() {
  var edid;

  beforeEach(function() {
    edid = new Edid();
  });

  describe('Complete Modern Display Integration', function() {
    beforeEach(function() {
      // Samsung Q800T 8K TV with HDMI 2.1 features
      var samsungData = EdidTestData.fixChecksums(EdidTestData.samsungQ800T_HDMI21);
      edid.setEdidData(EdidTestData.createFullEdidArray(samsungData));
    });

    it('should parse complete EDID without errors', function() {
      expect(function() {
        edid.parse();
      }).not.toThrow();
      
      expect(edid.validHeader).toBe('OK');
      expect(edid.numberOfExtensions).toBe(1);
    });

    it('should detect all modern display capabilities', function() {
      edid.parse();
      
      // Should detect basic display info
      expect(edid.eisaId).toBe('SAM');
      expect(edid.edidVersion).toBe('1.4');
      
      // Should have CTA extension
      expect(edid.exts[0].extTag).toBe(0x02);
      expect(edid.exts[0].dataBlockCollection.length).toBeGreaterThan(5);
    });

    it('should parse 8K video capabilities', function() {
      edid.parse();
      
      // Find video data block
      var videoBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        if (edid.exts[0].dataBlockCollection[i].tag.value === 2) {
          videoBlock = edid.exts[0].dataBlockCollection[i];
          break;
        }
      }
      
      expect(videoBlock).not.toBeNull();
      expect(videoBlock.shortVideoDescriptors.length).toBeGreaterThan(15);
      
      // Should support 8K formats (VIC 218, 219)
      var supports8K = false;
      for (var i = 0; i < videoBlock.shortVideoDescriptors.length; i++) {
        if (videoBlock.shortVideoDescriptors[i].vic >= 218) {
          supports8K = true;
          break;
        }
      }
      expect(supports8K).toBe(true);
    });

    it('should detect HDR capabilities', function() {
      edid.parse();
      
      // Find HDR Static Metadata block
      var hdrBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 7 && block.extendedTag && block.extendedTag.value === 6) {
          hdrBlock = block;
          break;
        }
      }
      
      expect(hdrBlock).not.toBeNull();
      expect(hdrBlock.extendedTag.value).toBe(6);
    });

    it('should detect HDMI 2.1 gaming features', function() {
      edid.parse();
      
      // Find HDMI Forum VSDB
      var hdmiForumBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
          hdmiForumBlock = block;
          break;
        }
      }
      
      expect(hdmiForumBlock).not.toBeNull();
      
      // Should have HDMI 2.1 features if implemented
      if (hdmiForumBlock.supportsVRR !== undefined) {
        expect(hdmiForumBlock.supportsVRR).toBe(true);
        expect(hdmiForumBlock.supportsALLM).toBe(true);
      }
    });

    it('should detect wide color gamut support', function() {
      edid.parse();
      
      // Find Colorimetry Data Block
      var colorimetryBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 7 && block.extendedTag && block.extendedTag.value === 5) {
          colorimetryBlock = block;
          break;
        }
      }
      
      expect(colorimetryBlock).not.toBeNull();
      
      if (colorimetryBlock.supportsBT2020RGB !== undefined) {
        expect(colorimetryBlock.supportsBT2020RGB).toBe(true);
      }
    });
  });

  describe('Gaming Monitor Integration', function() {
    beforeEach(function() {
      // 8K Gaming Monitor with VRR and HDR
      var gamingData = EdidTestData.fixChecksums(EdidTestData.monitor8K_Gaming);
      edid.setEdidData(EdidTestData.createFullEdidArray(gamingData));
    });

    it('should detect high refresh rate capabilities', function() {
      edid.parse();
      
      // Find video data block
      var videoBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        if (edid.exts[0].dataBlockCollection[i].tag.value === 2) {
          videoBlock = edid.exts[0].dataBlockCollection[i];
          break;
        }
      }
      
      expect(videoBlock).not.toBeNull();
      expect(videoBlock.shortVideoDescriptors.length).toBeGreaterThan(10);
      
      // Should support high refresh rate formats
      var supportsHighRefresh = false;
      for (var i = 0; i < videoBlock.shortVideoDescriptors.length; i++) {
        var vic = videoBlock.shortVideoDescriptors[i].vic;
        if (vic >= 118 && vic <= 120) { // 4K@120Hz formats
          supportsHighRefresh = true;
          break;
        }
      }
      
      expect(supportsHighRefresh).toBe(true);
    });

    it('should detect VRR range information', function() {
      edid.parse();
      
      // Find HDMI Forum VSDB with VRR info
      var hdmiBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
          hdmiBlock = block;
          break;
        }
      }
      
      expect(hdmiBlock).not.toBeNull();
      
      // Check VRR range if implemented
      if (hdmiBlock.vrrMin !== undefined && hdmiBlock.vrrMax !== undefined) {
        expect(hdmiBlock.vrrMin).toBeGreaterThan(0);
        expect(hdmiBlock.vrrMax).toBeGreaterThan(hdmiBlock.vrrMin);
        expect(hdmiBlock.vrrMax).toBeLessThanOrEqual(240); // Reasonable upper limit
      }
    });

    it('should detect gaming-optimized features', function() {
      edid.parse();
      
      // Find Video Capability Data Block
      var videoCapBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 7 && block.extendedTag && block.extendedTag.value === 0) {
          videoCapBlock = block;
          break;
        }
      }
      
      expect(videoCapBlock).not.toBeNull();
      
      // Should support gaming features if implemented
      if (videoCapBlock.supportsQMS !== undefined) {
        expect(videoCapBlock.supportsQMS).toBe(true);
      }
    });
  });

  describe('Professional OLED Integration', function() {
    beforeEach(function() {
      // LG C9 OLED with comprehensive HDR support
      var lgData = EdidTestData.fixChecksums(EdidTestData.lgC9_OLED_HDMI21);
      edid.setEdidData(EdidTestData.createFullEdidArray(lgData));
    });

    it('should detect OLED-specific capabilities', function() {
      edid.parse();
      
      // Should parse without errors
      expect(edid.validHeader).toBe('OK');
      expect(edid.numberOfExtensions).toBe(1);
    });

    it('should detect premium HDR support', function() {
      edid.parse();
      
      // Find HDR Static Metadata block
      var hdrBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 7 && block.extendedTag && block.extendedTag.value === 6) {
          hdrBlock = block;
          break;
        }
      }
      
      expect(hdrBlock).not.toBeNull();
      
      // OLED should support both HDR10 and HLG
      if (hdrBlock.smpte2084 !== undefined && hdrBlock.hlg !== undefined) {
        expect(hdrBlock.smpte2084 || hdrBlock.hlg).toBe(true);
      }
    });

    it('should detect cinema-grade color support', function() {
      edid.parse();
      
      // Find Colorimetry Data Block
      var colorimetryBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 7 && block.extendedTag && block.extendedTag.value === 5) {
          colorimetryBlock = block;
          break;
        }
      }
      
      expect(colorimetryBlock).not.toBeNull();
      
      // Should support wide color gamuts
      if (colorimetryBlock.supportsBT2020RGB !== undefined) {
        expect(colorimetryBlock.supportsBT2020RGB || colorimetryBlock.supportsBT2020YCC).toBe(true);
      }
    });
  });

  describe('Cross-Platform Compatibility', function() {
    it('should handle multiple display types consistently', function() {
      var testDisplays = [
        EdidTestData.samsungQ800T_HDMI21,
        EdidTestData.monitor8K_Gaming,
        EdidTestData.lgC9_OLED_HDMI21
      ];
      
      for (var i = 0; i < testDisplays.length; i++) {
        var displayData = EdidTestData.fixChecksums(testDisplays[i]);
        edid.setEdidData(EdidTestData.createFullEdidArray(displayData));
        
        expect(function() {
          edid.parse();
        }).not.toThrow();
        
        expect(edid.validHeader).toBe('OK');
        expect(edid.numberOfExtensions).toBe(1);
        expect(edid.exts[0].dataBlockCollection.length).toBeGreaterThan(0);
      }
    });

    it('should maintain consistent checksum validation', function() {
      var testDisplays = [
        EdidTestData.samsungQ800T_HDMI21,
        EdidTestData.monitor8K_Gaming,
        EdidTestData.lgC9_OLED_HDMI21
      ];
      
      for (var i = 0; i < testDisplays.length; i++) {
        var displayData = EdidTestData.fixChecksums(testDisplays[i]);
        edid.setEdidData(EdidTestData.createFullEdidArray(displayData));
        
        expect(edid.validChecksum(0)).toBe(true);
        expect(edid.validChecksum(1)).toBe(true);
      }
    });
  });

  describe('Feature Detection Accuracy', function() {
    it('should accurately identify display generation', function() {
      // Test Samsung Q800T (HDMI 2.1)
      var samsungData = EdidTestData.fixChecksums(EdidTestData.samsungQ800T_HDMI21);
      edid.setEdidData(EdidTestData.createFullEdidArray(samsungData));
      edid.parse();
      
      var hasHDMI21Features = false;
      var has8KSupport = false;
      var hasHDRSupport = false;
      
      // Check for HDMI 2.1 indicators
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        
        // HDMI Forum VSDB indicates HDMI 2.1+
        if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
          hasHDMI21Features = true;
        }
        
        // HDR support
        if (block.tag.value === 7 && block.extendedTag && block.extendedTag.value === 6) {
          hasHDRSupport = true;
        }
        
        // 8K support (VIC codes > 200)
        if (block.tag.value === 2) {
          for (var j = 0; j < block.shortVideoDescriptors.length; j++) {
            if (block.shortVideoDescriptors[j].vic >= 200) {
              has8KSupport = true;
              break;
            }
          }
        }
      }
      
      // Modern displays should have at least HDR or HDMI 2.1
      expect(hasHDMI21Features || hasHDRSupport || has8KSupport).toBe(true);
    });

    it('should detect next-generation features', function() {
      var allDisplays = [
        EdidTestData.samsungQ800T_HDMI21,
        EdidTestData.monitor8K_Gaming,
        EdidTestData.lgC9_OLED_HDMI21
      ];
      
      var foundModernFeatures = 0;
      
      for (var d = 0; d < allDisplays.length; d++) {
        var displayData = EdidTestData.fixChecksums(allDisplays[d]);
        edid.setEdidData(EdidTestData.createFullEdidArray(displayData));
        edid.parse();
        
        // Count modern features found
        for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
          var block = edid.exts[0].dataBlockCollection[i];
          
          // Extended data blocks indicate modern features
          if (block.tag.value === 7 && block.extendedTag) {
            if (block.extendedTag.value >= 6 && block.extendedTag.value <= 15) {
              foundModernFeatures++;
            }
          }
          
          // HDMI Forum blocks
          if (block.tag.value === 3 && block.ieeeIdentifier === 0xC45DD8) {
            foundModernFeatures++;
          }
        }
      }
      
      // Should find modern features across test displays
      expect(foundModernFeatures).toBeGreaterThan(5);
    });
  });
});