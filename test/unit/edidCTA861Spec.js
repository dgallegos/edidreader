'use strict';

/* jasmine specs for CTA-861 Extension parsing */

describe('CTA-861 Extension Parsing', function() {
  var edid;

  beforeEach(function() {
    edid = new Edid();
  });

  describe('Extension Block Header', function() {
    beforeEach(function() {
      // Create EDID with CTA-861 extension
      var ctaEdid = EdidTestData.createFullEdidArray(EdidTestData.basic1080pMonitor);
      // Add a basic CTA extension
      ctaEdid[126] = 1; // 1 extension block
      var ctaExtension = [
        0x02, 0x03, 0x1F, 0xF1, // CTA-861 tag, rev 3, length 31, flags
        0x23, 0x09, 0x07, 0x07, // Basic video/audio data
        0x83, 0x01, 0x00, 0x00, // Speaker allocation
        0x65, 0x03, 0x0C, 0x00, // HDMI VSDB header
        0x10, 0x00, 0x88, 0x3C, // Physical address, TMDS
        0x2F, 0x80, 0x90, 0x01, // Latency info
        0x02, 0x3A, 0x80, 0x18, 0x71, 0x38, 0x2D, 0x40, // DTD
        0x58, 0x2C, 0x45, 0x00, 0x56, 0x50, 0x21, 0x00, 0x00, 0x1E,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Padding
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00
      ];
      
      // Fix checksums
      ctaEdid[127] = EdidTestData.calculateChecksum(ctaEdid.slice(0, 127));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension.slice(0, 127));
      
      edid.setEdidData(ctaEdid.concat(ctaExtension));
    });

    it('should parse CTA extension tag correctly', function() {
      edid.parse();
      expect(edid.exts[0].extTag).toBe(0x02); // CTA-861
    });

    it('should parse revision number correctly', function() {
      edid.parse();
      expect(edid.exts[0].revisionNumber).toBe(0x03);
    });

    it('should parse DTD start offset', function() {
      edid.parse();
      expect(edid.exts[0].dtdStart).toBe(0x1F);
    });

    it('should parse support flags', function() {
      edid.parse();
      expect(edid.exts[0].underscan).toBe(true);
      expect(edid.exts[0].basicAudio).toBe(true);
      expect(edid.exts[0].ycbcr444).toBe(true);
      expect(edid.exts[0].ycbcr422).toBe(true);
    });
  });

  describe('Video Data Block Parsing', function() {
    beforeEach(function() {
      // Create EDID with specific VIC codes
      var videoEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00,
        0x4C, 0x2D, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x1E, 0x01, 0x04, 0x95, 0x3C, 0x22, 0x78, 0x0E,
        0x91, 0xA3, 0x54, 0x4C, 0x99, 0x26, 0x0F, 0x50, 0x54,
        0x21, 0x08, 0x00, 0xD1, 0xC0, 0xA9, 0xC0, 0x81, 0xC0,
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x02, 0x3A, 0x80, 0x18, 0x71, 0x38, 0x2D, 0x40,
        0x58, 0x2C, 0x45, 0x00, 0x58, 0x54, 0x21, 0x00, 0x00, 0x1E,
        0x00, 0x00, 0x00, 0xFD, 0x00, 0x32, 0x4C, 0x1E,
        0x53, 0x10, 0x00, 0x0A, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0xFC, 0x00, 0x54, 0x65, 0x73,
        0x74, 0x20, 0x4D, 0x6F, 0x6E, 0x69, 0x74, 0x6F, 0x72, 0x0A,
        0x00, 0x00, 0x00, 0xFF, 0x00, 0x31, 0x32, 0x33,
        0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x30, 0x0A, 0x20, 0x20,
        0x01, 0x00
      ];
      
      var ctaExtension = [
        0x02, 0x03, 0x20, 0xF1,                         // CTA-861, rev 3, length 32, flags
        0x4A, 0x90, 0x04, 0x03, 0x02, 0x01, 0x06, 0x07, // Video Data Block: VIC 16,4,3,2,1 + native flag on VIC 16
        0x11, 0x12, 0x13, 0x84, 0x85, 0x86,            // More VICs, VIC 4 is native (0x84)
        0x23, 0x09, 0x07, 0x07,                         // Audio Data Block: LPCM 2ch
        0x83, 0x01, 0x00, 0x00,                         // Speaker Allocation: FL/FR
        0x65, 0x03, 0x0C, 0x00, 0x10, 0x00,            // HDMI VSDB
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Padding to DTD start
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00
      ];
      
      // Fix checksums
      videoEdid[127] = EdidTestData.calculateChecksum(videoEdid.slice(0, 127));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension.slice(0, 127));
      
      edid.setEdidData(videoEdid.concat(ctaExtension));
    });

    it('should parse video data block', function() {
      edid.parse();
      var dataBlock = edid.exts[0].dataBlockCollection[0];
      expect(dataBlock.tag.value).toBe(2); // Video Data Block
      expect(dataBlock.shortVideoDescriptors.length).toBeGreaterThan(0);
    });

    it('should parse VIC codes correctly', function() {
      edid.parse();
      var videoBlock = edid.exts[0].dataBlockCollection[0];
      
      // Check for specific VIC codes (adjusting for the data structure)
      var foundVIC16 = false, foundVIC4 = false;
      for (var i = 0; i < videoBlock.shortVideoDescriptors.length; i++) {
        var svd = videoBlock.shortVideoDescriptors[i];
        if (svd.vic === 16) foundVIC16 = true;
        if (svd.vic === 4) foundVIC4 = true;
      }
      expect(foundVIC16).toBe(true);
      expect(foundVIC4).toBe(true);
    });

    it('should detect native resolution flags', function() {
      edid.parse();
      var videoBlock = edid.exts[0].dataBlockCollection[0];
      
      // Look for native resolution indicators
      var hasNativeFlag = false;
      for (var i = 0; i < videoBlock.shortVideoDescriptors.length; i++) {
        if (videoBlock.shortVideoDescriptors[i].nativeResolution === true) {
          hasNativeFlag = true;
          break;
        }
      }
      expect(hasNativeFlag).toBe(true);
    });
  });

  describe('Audio Data Block Parsing', function() {
    beforeEach(function() {
      // Create EDID with audio data block
      var audioEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00,
        0x4C, 0x2D, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x01, 0x1E, 0x01, 0x04, 0x95, 0x3C, 0x22, 0x78, 0x0E,
        0x91, 0xA3, 0x54, 0x4C, 0x99, 0x26, 0x0F, 0x50, 0x54,
        0x21, 0x08, 0x00, 0xD1, 0xC0, 0xA9, 0xC0, 0x81, 0xC0,
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        0x02, 0x3A, 0x80, 0x18, 0x71, 0x38, 0x2D, 0x40,
        0x58, 0x2C, 0x45, 0x00, 0x58, 0x54, 0x21, 0x00, 0x00, 0x1E,
      ].concat(new Array(54).fill(0));
      audioEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x18, 0xF1,                         // CTA-861, rev 3, length 24, flags
        0x47, 0x10, 0x04, 0x03, 0x02, 0x01,            // Video Data Block
        0x29, 0x09, 0x07, 0x07, 0x15, 0x07, 0x50,      // Audio: LPCM 2ch 48/44.1/32kHz 24/20/16bit
        0x2A, 0x0F, 0x07, 0x16, 0x3C, 0x07, 0x30,      // Audio: AC-3 8ch, additional formats
        0x83, 0x01, 0x00, 0x00,                         // Speaker allocation: FL/FR
      ].concat(new Array(109).fill(0));
      
      // Fix checksums
      audioEdid[127] = EdidTestData.calculateChecksum(audioEdid.slice(0, 127));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension.slice(0, 127));
      
      edid.setEdidData(audioEdid.concat(ctaExtension));
    });

    it('should parse audio data block', function() {
      edid.parse();
      var audioBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        if (edid.exts[0].dataBlockCollection[i].tag.value === 1) {
          audioBlock = edid.exts[0].dataBlockCollection[i];
          break;
        }
      }
      expect(audioBlock).not.toBeNull();
      expect(audioBlock.shortAudioDescriptors.length).toBeGreaterThan(0);
    });

    it('should parse LPCM audio format correctly', function() {
      edid.parse();
      var audioBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        if (edid.exts[0].dataBlockCollection[i].tag.value === 1) {
          audioBlock = edid.exts[0].dataBlockCollection[i];
          break;
        }
      }
      
      var lpcmDescriptor = audioBlock.shortAudioDescriptors[0];
      expect(lpcmDescriptor.format).toBe(1); // LPCM
      expect(lpcmDescriptor.maxChannels).toBe(2);
      expect(lpcmDescriptor.sampleRates & 0x07).toBeGreaterThan(0); // 48/44.1/32 kHz support
    });
  });

  describe('Speaker Allocation Data Block', function() {
    beforeEach(function() {
      var speakerEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00,
      ].concat(new Array(120).fill(0));
      speakerEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x10, 0xF1,                         // CTA-861, rev 3, length 16, flags
        0x47, 0x10, 0x04, 0x03, 0x02, 0x01,            // Video Data Block
        0x83, 0x01, 0x00, 0x00,                         // Speaker Allocation: FL/FR only
        0x86, 0x03, 0x0D, 0x07, 0x15,                   // Speaker Allocation: 5.1 setup
      ].concat(new Array(111).fill(0));
      
      // Fix checksums
      speakerEdid[127] = EdidTestData.calculateChecksum(speakerEdid.slice(0, 127));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension.slice(0, 127));
      
      edid.setEdidData(speakerEdid.concat(ctaExtension));
    });

    it('should parse speaker allocation data block', function() {
      edid.parse();
      var speakerBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        if (edid.exts[0].dataBlockCollection[i].tag.value === 4) {
          speakerBlock = edid.exts[0].dataBlockCollection[i];
          break;
        }
      }
      expect(speakerBlock).not.toBeNull();
      expect(speakerBlock.payload).toBeDefined();
    });
  });

  describe('Extended Tag Data Blocks', function() {
    beforeEach(function() {
      var extendedEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00,
      ].concat(new Array(120).fill(0));
      extendedEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x25, 0xF1,                         // CTA-861, rev 3, length 37, flags
        0x47, 0x10, 0x04, 0x03, 0x02, 0x01,            // Video Data Block
        0x78, 0x00, 0x0F,                               // Extended tag: Video Capability (tag 7, extended tag 0)
        0x7C, 0x05, 0xC0, 0x01, 0x02, 0x03, 0x04,      // Extended tag: Colorimetry (tag 7, extended tag 5)
        0x7F, 0x0E, 0x01, 0x02, 0x03, 0x04, 0x05,      // Extended tag: YCbCr 4:2:0 Video (tag 7, extended tag 14)
        0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E,
        0x7F, 0x0F, 0x80, 0x01,                         // Extended tag: YCbCr 4:2:0 Capability Map (tag 7, extended tag 15)
      ].concat(new Array(91).fill(0));
      
      // Fix checksums
      extendedEdid[127] = EdidTestData.calculateChecksum(extendedEdid.slice(0, 127));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension.slice(0, 127));
      
      edid.setEdidData(extendedEdid.concat(ctaExtension));
    });

    it('should parse extended tag data blocks', function() {
      edid.parse();
      var extendedBlocks = [];
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        if (edid.exts[0].dataBlockCollection[i].tag.value === 7) {
          extendedBlocks.push(edid.exts[0].dataBlockCollection[i]);
        }
      }
      expect(extendedBlocks.length).toBeGreaterThan(0);
    });

    it('should identify video capability data block', function() {
      edid.parse();
      var videoCapBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 7 && block.extendedTag && block.extendedTag.value === 0) {
          videoCapBlock = block;
          break;
        }
      }
      expect(videoCapBlock).not.toBeNull();
    });

    it('should identify colorimetry data block', function() {
      edid.parse();
      var colorimetryBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 7 && block.extendedTag && block.extendedTag.value === 5) {
          colorimetryBlock = block;
          break;
        }
      }
      expect(colorimetryBlock).not.toBeNull();
    });
  });

  describe('YCbCr 4:2:0 Support', function() {
    beforeEach(function() {
      var ycbcrEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00,
      ].concat(new Array(120).fill(0));
      ycbcrEdid[126] = 1;
      
      var ctaExtension = [
        0x02, 0x03, 0x20, 0xF1,                         // CTA-861, rev 3, length 32, flags
        0x4A, 0x90, 0x04, 0x03, 0x02, 0x01, 0x06, 0x5F, // Video Data Block with 4K formats
        0x60, 0x61, 0x62,                               // More 4K VICs
        0x7F, 0x0E, 0x5F, 0x60, 0x61,                  // YCbCr 4:2:0 Video Data Block (extended tag 14)
        0x7F, 0x0F, 0x80, 0x01,                         // YCbCr 4:2:0 Capability Map (extended tag 15)
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Padding
      ].concat(new Array(96).fill(0));
      
      // Fix checksums
      ycbcrEdid[127] = EdidTestData.calculateChecksum(ycbcrEdid.slice(0, 127));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension.slice(0, 127));
      
      edid.setEdidData(ycbcrEdid.concat(ctaExtension));
    });

    it('should parse YCbCr 4:2:0 video data block', function() {
      edid.parse();
      var ycbcr420Block = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 7 && block.extendedTag && block.extendedTag.value === 14) {
          ycbcr420Block = block;
          break;
        }
      }
      expect(ycbcr420Block).not.toBeNull();
      expect(ycbcr420Block.YCbCr420OnlyShortVideoDescriptors).toBeDefined();
    });

    it('should parse YCbCr 4:2:0 capability map', function() {
      edid.parse();
      var capabilityMapBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        var block = edid.exts[0].dataBlockCollection[i];
        if (block.tag.value === 7 && block.extendedTag && block.extendedTag.value === 15) {
          capabilityMapBlock = block;
          break;
        }
      }
      expect(capabilityMapBlock).not.toBeNull();
      expect(capabilityMapBlock.YCbCr420CapableShortVideoDescriptors).toBeDefined();
    });
  });

  describe('CTA Extension Checksum', function() {
    it('should validate extension block checksum', function() {
      var simpleEdid = EdidTestData.fixChecksums(EdidTestData.basic1080pMonitor);
      simpleEdid.block0[126] = 1; // Add extension
      
      var ctaExtension = [
        0x02, 0x03, 0x04, 0x00, // Minimal CTA extension
      ].concat(new Array(124).fill(0));
      ctaExtension[127] = EdidTestData.calculateChecksum(ctaExtension);
      
      edid.setEdidData(EdidTestData.createFullEdidArray(simpleEdid).concat(ctaExtension));
      edid.parse();
      
      expect(edid.validChecksum(1)).toBe(true);
    });
  });

  describe('Real World CTA Example', function() {
    beforeEach(function() {
      // Use Samsung Q800T test data
      var samsungData = EdidTestData.fixChecksums(EdidTestData.samsungQ800T_HDMI21);
      edid.setEdidData(EdidTestData.createFullEdidArray(samsungData));
    });

    it('should parse Samsung Q800T CTA extension successfully', function() {
      edid.parse();
      expect(edid.numberOfExtensions).toBe(1);
      expect(edid.exts[0].extTag).toBe(0x02);
      expect(edid.exts[0].dataBlockCollection.length).toBeGreaterThan(0);
    });

    it('should detect modern video capabilities', function() {
      edid.parse();
      
      // Look for video data block with modern VIC codes
      var videoBlock = null;
      for (var i = 0; i < edid.exts[0].dataBlockCollection.length; i++) {
        if (edid.exts[0].dataBlockCollection[i].tag.value === 2) {
          videoBlock = edid.exts[0].dataBlockCollection[i];
          break;
        }
      }
      
      expect(videoBlock).not.toBeNull();
      expect(videoBlock.shortVideoDescriptors.length).toBeGreaterThan(10); // Many formats supported
    });
  });
});