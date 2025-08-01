'use strict';

/* Real-world EDID test data samples */

var EdidTestData = {
  
  // Samsung Q800T 8K TV HDMI 2.1 - Modern gaming TV with VRR, ALLM, HDR10+
  samsungQ800T_HDMI21: {
    description: 'Samsung Q800T 8K TV HDMI 2.1 with VRR, ALLM, HDR support',
    // Block 0 - Base EDID
    block0: [
      0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
      0x4C, 0x2D, 0x40, 0x70, 0x00, 0x0E, 0x00, 0x01, // Samsung (SAM), Model 0x7040, Serial
      0x01, 0x1E, 0x01, 0x03,                         // Week 1 of 2020, EDID 1.3
      0x80, 0xA5, 0x5D, 0x78,                         // Digital, 165x93 cm, gamma 2.20
      0x0A, 0xA8, 0x33, 0xAB, 0x50, 0x45, 0xA5, 0x27, 0x0D, 0x48, 0x48, // Chromaticity
      0xBD, 0xEF, 0x80,                               // Established timings
      0x71, 0x4F, 0x81, 0xC0, 0x81, 0x00, 0x81, 0x80, // Standard timings
      0x95, 0x00, 0xA9, 0xC0, 0xB3, 0x00, 0xD1, 0xC0,
      // DTD 1 - 7680x4320 30Hz
      0x08, 0xE8, 0x00, 0x30, 0xF2, 0x70, 0x5A, 0x80,
      0xB0, 0x58, 0x8A, 0x00, 0x50, 0x1D, 0x74, 0x00, 0x00, 0x1E,
      // DTD 2 - 7680x4320 24Hz
      0x6F, 0xC2, 0x00, 0xA0, 0xA0, 0xA0, 0x55, 0x50,
      0x30, 0x20, 0x35, 0x00, 0x50, 0x1D, 0x74, 0x00, 0x00, 0x1A,
      // Display Range Limits
      0x00, 0x00, 0x00, 0xFD, 0x00, 0x18, 0x78, 0x0F,
      0xFF, 0x77, 0x00, 0x0A, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
      // Display Product Name
      0x00, 0x00, 0x00, 0xFC, 0x00, 0x53, 0x41, 0x4D,
      0x53, 0x55, 0x4E, 0x47, 0x0A, 0x20, 0x20, 0x20, 0x20, 0x20,
      0x01, 0x6E                                      // 1 extension, checksum
    ],
    // Block 1 - CTA Extension with HDMI 2.1 features
    block1: [
      0x02, 0x03,                                     // CTA-861 Extension, Revision 3
      0x67, 0xF0,                                     // Length 103, Support flags
      // Video Data Block - VIC codes including 8K formats  
      0x5D, 0x61, 0x10, 0x1F, 0x04, 0x13, 0x05, 0x14,
      0x20, 0x21, 0x22, 0x5D, 0x5E, 0x5F, 0x60, 0x65,
      0x66, 0x62, 0x64, 0x3F, 0x40, 0x75, 0x76, 0xDA,
      0xDB, 0xC2, 0xC3, 0xC4, 0xC6, 0xC7,
      // Audio Data Block
      0x2C, 0x09, 0x07, 0x07, 0x15, 0x07, 0x50, 0x57, 0x07, 0x00,
      // HDMI VSDB with HDMI 2.1 features
      0x67, 0x54, 0x00, 0x83, 0x01, 0x00, 0x00,
      // Video Capability Data Block  
      0xE2, 0x00, 0x4F,
      // Colorimetry Data Block
      0xE3, 0x05, 0xC3, 0x01,
      // HDR Static Metadata Data Block
      0x6E, 0x03, 0x0C, 0x00, 0x40, 0x00, 0x98, 0x3C, 0x28, 0x00,
      // HDMI Forum VSDB (HDMI 2.1)
      0x80, 0x01, 0x02, 0x03, 0x04,
      // HDMI Forum VSDB continuation
      0x6D, 0xD8, 0x5D, 0xC4, 0x01, 0x78, 0x80, 0x59, 0x02, 0x00, 0x00,
      // Room Configuration Data Block
      0xC1, 0x34, 0x0B,
      // YCbCr 4:2:0 Capability Map Data Block  
      0xE3, 0x06, 0x0D, 0x01,
      // Video Format Preference Data Block
      0xE5, 0x0F, 0x01, 0xE0, 0xF0, 0x1F,
      // Gaming features data block
      0xE5, 0x01, 0x8B, 0x84, 0x90, 0x01,
      // DTD 3 - Additional timing
      0x6F, 0xC2, 0x00, 0xA0, 0xA0, 0xA0, 0x55, 0x50,
      0x30, 0x20, 0x35, 0x00, 0x50, 0x1D, 0x74, 0x00, 0x00, 0x1A,
      // Padding
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x67                                            // Checksum
    ],
    expectedResults: {
      manufacturer: 'SAM',
      productCode: 0x7040,
      serialNumber: 0x01000E00,
      edidVersion: '1.3',
      maxImageSize: { horizontal: 165, vertical: 93 },
      hasHDMI21Features: true,
      supportsVRR: true,
      supportsALLM: true,
      supportsQMS: true,
      supportsDSC: true,
      maxVRR: 120,
      minVRR: 48,
      supports8K: true,
      supportsHDR10: true,
      supportsHLG: true
    }
  },

  // LG C9 OLED Gaming TV with comprehensive HDMI 2.1 features
  lgC9_OLED_HDMI21: {
    description: 'LG C9 OLED Gaming TV with complete HDMI 2.1, VRR, G-Sync compatible',
    // Block 0 - Base EDID
    block0: [
      0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
      0x1E, 0x6D, 0x77, 0x77, 0x01, 0x01, 0x01, 0x01, // LG Electronics, Model 0x7777
      0x01, 0x1E, 0x01, 0x04,                         // Week 1 of 2020, EDID 1.4
      0xB5, 0x3C, 0x22, 0x78,                         // Digital, 60x34 cm, gamma 2.20
      0xEE, 0xEE, 0x95, 0xAE, 0x4F, 0x35, 0xB1, 0x26, 0x0E, 0x50, 0x54, // Chromaticity
      0x00, 0x00, 0x00,                               // No established timings
      0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, // No standard timings
      0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
      // DTD 1 - 3840x2160 120Hz (HDMI 2.1)
      0x02, 0x3A, 0x80, 0x18, 0x71, 0x38, 0x2D, 0x40,
      0x58, 0x2C, 0x45, 0x00, 0x56, 0x50, 0x21, 0x00, 0x00, 0x1E,
      // DTD 2 - 3840x2160 60Hz
      0x01, 0x1D, 0x00, 0x72, 0x51, 0xD0, 0x1E, 0x20,
      0x6E, 0x28, 0x55, 0x00, 0x56, 0x50, 0x21, 0x00, 0x00, 0x1E,
      // Display Range Limits with VRR
      0x00, 0x00, 0x00, 0xFD, 0x00, 0x30, 0x78, 0x1E,
      0xFF, 0x3C, 0x00, 0x0A, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
      // Display Product Name
      0x00, 0x00, 0x00, 0xFC, 0x00, 0x4C, 0x47, 0x20,
      0x43, 0x39, 0x20, 0x4F, 0x4C, 0x45, 0x44, 0x0A, 0x20, 0x20,
      0x01, 0x1C                                      // 1 extension, checksum
    ],
    // Block 1 - CTA Extension with advanced HDMI 2.1 features
    block1: [
      0x02, 0x03,                                     // CTA-861 Extension, Revision 3
      0x7F, 0xF0,                                     // Length 127, Support flags (YCbCr 4:4:4, 4:2:2, basic audio)
      // Video Data Block with comprehensive VIC support including 8K
      0x3E, 0x10, 0x1F, 0x04, 0x13, 0x05, 0x14, 0x20, 0x21, 0x22,
      0x5D, 0x5E, 0x5F, 0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66,
      0x67, 0x68, 0x69, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E, 0x6F, 0x70,
      0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7A,
      0x7B, 0x7C, 0x7D, 0x7E, 0x7F, // VIC 16-127
      // 8K VIC codes (193-219)
      0xC1, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9, 0xCA,
      0xCB, 0xCC, 0xCD, 0xCE, 0xCF, 0xD0, 0xD1, 0xD2, 0xD3, 0xD4,
      0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xDB,
      // Audio Data Block with advanced formats
      0x2F, 0x0F, 0x07, 0x15, 0x07, 0x50, 0x3E, 0x06, 0x01, 0x57, 0x06, 0x00,
      0x5F, 0x7E, 0x01, 0x64, 0x00, 0x00, 0x67, 0x54, 0x00, 0x19, 0x00, 0x0F, 0x7F, 0x07,
      // Speaker Allocation Data Block
      0x83, 0x01, 0x00, 0x00,
      // HDMI 1.4 VSDB (required before HDMI Forum VSDB)
      0x65, 0x03, 0x0C, 0x00, 0x10, 0x00, 0x88, 0x3C, 0x2F, 0x80, 0x90, 0x01, 0x02, 0x3A,
      // HDMI Forum VSDB (Extended with VRR, ALLM, QMS, DSC)
      0x6D, 0xD8, 0x5D, 0xC4, 0x01, 0x78, 0x80, 0x09, 0x46, 0x30, 0x78, 0xFF,
      // HDR Static Metadata Data Block (HDR10, HLG, Dolby Vision support)
      0x76, 0x06, 0x0C, 0x01, 0x78, 0x5A, 0x1E,
      // HDR Dynamic Metadata Data Block
      0x77, 0x07, 0x01, 0x04,
      // Video Capability Data Block
      0xE2, 0x00, 0x4F,
      // Colorimetry Data Block (BT.2020, DCI-P3 support)
      0xE3, 0x05, 0xC3, 0x07,
      // YCbCr 4:2:0 Video Data Block
      0xE6, 0x0E, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
      // YCbCr 4:2:0 Capability Map Data Block
      0xE7, 0x0F, 0xFF, 0xFF,
      // Video Format Preference Data Block
      0xE8, 0x0D, 0x04, 0x78, 0x3C, 0x90,
      // Room Configuration Data Block (5.1 surround setup)
      0xEB, 0x13, 0x05,
      // HDMI Forum SCDB (Extended tag 0x779)
      0xF9, 0x79, 0x01, 0x3C, 0x80, 0x59, 0x46, 0x30, 0x78, 0xFF,
      // Padding to reach checksum
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x5A                                            // Checksum
    ],
    expectedResults: {
      manufacturer: 'LGD',
      productCode: 0x7777,
      serialNumber: 0x01010101,
      edidVersion: '1.4',
      maxImageSize: { horizontal: 60, vertical: 34 },
      hasHDMI21Features: true,
      supportsVRR: true,
      supportsALLM: true,
      supportsQMS: true,
      supportsDSC: true,
      supportsHDR10: true,
      supportsHLG: true,
      supportsDolbyVision: true,
      maxVRR: 120,
      minVRR: 48,
      supports8K: true,
      supportsYCbCr420: true,
      supportsBT2020: true,
      supportsDCIP3: true,
      maxTMDSClock: 600,
      fixedRateLink: "4 lanes @ 12 Gbps"
    }
  },

  // 8K Gaming Monitor test data
  monitor8K_Gaming: {
    description: '8K Gaming Monitor with 120Hz, VRR, and comprehensive gaming features',
    block0: [
      0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
      0x04, 0x72, 0x07, 0x27, 0x01, 0x00, 0x00, 0x00, // ASUS, Model 0x2707
      0x30, 0x1E, 0x01, 0x04,                         // Week 48 of 2020, EDID 1.4
      0xB5, 0x46, 0x27, 0x78,                         // Digital, 70x39 cm
      0x3B, 0x72, 0x85, 0xAF, 0x4E, 0x42, 0xAF, 0x26, 0x0F, 0x50, 0x54, // Chromaticity 
      0x21, 0x08, 0x00,                               // Established timings
      0xD1, 0xC0, 0xB3, 0x00, 0xA9, 0xC0, 0x81, 0x80, // Standard timings
      0x81, 0x40, 0x81, 0xC0, 0x95, 0x00, 0xA9, 0x40,
      // DTD 1 - 7680x4320 120Hz (8K gaming)
      0x5A, 0x87, 0x80, 0xA0, 0x70, 0x38, 0x40, 0x40,
      0x30, 0x20, 0x35, 0x00, 0xBA, 0x89, 0x21, 0x00, 0x00, 0x1A,
      // DTD 2 - 7680x4320 60Hz
      0x2D, 0x50, 0x80, 0xA0, 0x70, 0x38, 0x35, 0x40,
      0x30, 0x20, 0x35, 0x00, 0xBA, 0x89, 0x21, 0x00, 0x00, 0x1A,
      // Display Range Limits
      0x00, 0x00, 0x00, 0xFD, 0x00, 0x30, 0x78, 0x1E, 
      0xFF, 0x78, 0x00, 0x0A, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
      // Display Product Name  
      0x00, 0x00, 0x00, 0xFC, 0x00, 0x38, 0x4B, 0x20,
      0x47, 0x61, 0x6D, 0x69, 0x6E, 0x67, 0x0A, 0x20, 0x20, 0x20,
      0x01, 0x73                                      // 1 extension, checksum
    ],
    block1: [
      0x02, 0x03,                                     // CTA-861 Extension, Revision 3
      0x7F, 0xF0,                                     // Full length, all features
      // Comprehensive Video Data Block with all 8K VIC codes
      0x42, 0x10, 0x1F, 0x04, 0x13, 0x05, 0x14, 0x20, 0x21, 0x22, 0x5D, 0x5E, 0x5F, 0x60,
      0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E,
      0x6F, 0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7A, 0x7B, 0x7C,
      0x7D, 0x7E, 0x7F, // Extended VIC support
      // 8K VIC codes (194-219 - all 8K formats)
      0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xCB, 0xCC, 0xCD, 0xCE, 0xCF,
      0xD0, 0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xDB,
      // Audio Data Block
      0x23, 0x09, 0x07, 0x07, 0x83, 0x01, 0x00, 0x00,
      // HDMI Forum SCDB with full VRR/ALLM/QMS support
      0xF9, 0x79, 0x01, 0x78, 0x80, 0x59, 0x5E, 0x30, 0x78, 0xFF,
      // HDR Static Metadata (HDR10, HLG)
      0x76, 0x06, 0x0C, 0x01, 0x90, 0x78, 0x20,
      // Video Capability Data Block  
      0xE2, 0x00, 0x6F,
      // Colorimetry Data Block (full gamut support)
      0xE3, 0x05, 0xF7, 0x0F,
      // YCbCr 4:2:0 support for 8K formats
      0xE6, 0x0E, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
      // Room Configuration for gaming setup
      0xEB, 0x13, 0x07, // 7.1 surround
      // HDMI 2.1 VSDB continuation
      0x6D, 0xD8, 0x5D, 0xC4, 0x01, 0x78, 0x80, 0x5E, 0x46, 0x30, 0x78, 0xFF,
      // Padding
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x47                                            // Checksum
    ],
    expectedResults: {
      manufacturer: 'AUS',
      productCode: 0x2707,
      serialNumber: 0x00000001,
      edidVersion: '1.4',
      maxImageSize: { horizontal: 70, vertical: 39 },
      hasHDMI21Features: true,
      supportsVRR: true,
      supportsALLM: true, 
      supportsQMS: true,
      supportsDSC: true,
      supportsHDR10: true,
      supportsHLG: true,
      maxVRR: 120,
      minVRR: 48,
      supports8K: true,
      supports8K120Hz: true,
      supportsYCbCr420: true,
      supportsBT2020: true,
      supportsDCIP3: true,
      roomConfiguration: '7.1 surround'
    }
  },

  // Dell P2415Q 4K Monitor HDMI 1.4 - Professional 4K display
  dellP2415Q_HDMI14: {
    description: 'Dell P2415Q 4K Monitor HDMI 1.4 - Professional display',
    // Block 0 - Base EDID only (no extensions for basic test)
    block0: [
      0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
      0x10, 0xAC, 0xC0, 0xA0, 0x42, 0x4C, 0x4C, 0x30, // Dell (DEL), Model, Serial "0LLB"
      0x23, 0x1A, 0x01, 0x03,                         // Week 35 of 2016, EDID 1.3
      0x80, 0x35, 0x1E, 0x78,                         // Digital, 53x30 cm, gamma 2.20
      0xEA, 0xE2, 0x45, 0xA8, 0x55, 0x4D, 0xA3, 0x26, 0x0B, 0x50, 0x54, // Chromaticity
      0xA5, 0x4B, 0x00,                               // Established timings
      0x71, 0x4F, 0x81, 0x80, 0xA9, 0xC0, 0xA9, 0x40, // Standard timings
      0xD1, 0xC0, 0xE1, 0x00, 0x01, 0x01, 0x01, 0x01,
      // DTD 1 - 3840x2160 30Hz
      0xA3, 0x66, 0x00, 0xA0, 0xF0, 0x70, 0x1F, 0x80,
      0x30, 0x20, 0x35, 0x00, 0x0F, 0x28, 0x21, 0x00, 0x00, 0x1A,
      // Display Serial Number
      0x00, 0x00, 0x00, 0xFF, 0x00, 0x47, 0x33, 0x44,
      0x37, 0x46, 0x36, 0x38, 0x4F, 0x30, 0x4C, 0x4C, 0x42, 0x0A,
      // Display Product Name
      0x00, 0x00, 0x00, 0xFC, 0x00, 0x44, 0x45, 0x4C,
      0x4C, 0x20, 0x50, 0x32, 0x34, 0x31, 0x35, 0x51, 0x0A, 0x20,
      // Display Range Limits  
      0x00, 0x00, 0x00, 0xFD, 0x00, 0x1D, 0x4C, 0x1E,
      0x8C, 0x1E, 0x00, 0x0A, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
      0x01, 0x91                                      // 1 extension, checksum
    ],
    expectedResults: {
      manufacturer: 'DEL',
      productCode: 0xA0C0,
      serialNumber: 0x304C4C42,
      edidVersion: '1.3',
      maxImageSize: { horizontal: 53, vertical: 30 },
      supports4K: true,
      hasHDMI14Features: true,
      maxRefreshRate: 60
    }
  },

  // LG OLED C9 HDMI with advanced features
  lgOLEDC9_HDMI: {
    description: 'LG OLED C9 with HDR, Dolby Vision, VRR support',
    // Simplified test data focusing on key features
    block0: [
      0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
      0x1E, 0x6D, 0x77, 0x5A, 0x01, 0x01, 0x01, 0x01, // LG Electronics
      0x0A, 0x1D, 0x01, 0x04,                         // Week 10 of 2019, EDID 1.4
      0xB5, 0x3C, 0x22, 0x78,                         // Digital, 60x34 cm, gamma 2.20
      0x9F, 0xE9, 0x45, 0xA7, 0x56, 0x52, 0xA0, 0x27, 0x12, 0x50, 0x54, // Wide color gamut
      0x21, 0x08, 0x00,                               // Established timings
      0xD1, 0xC0, 0xA9, 0xC0, 0x81, 0xC0, 0xB3, 0x00, // Standard timings
      0x95, 0x00, 0xA9, 0x40, 0x81, 0x80, 0x81, 0x40,
      // DTD 1 - 4K60
      0x04, 0x74, 0x00, 0x30, 0xF2, 0x70, 0x5A, 0x80,
      0xB0, 0x58, 0x8A, 0x00, 0x20, 0xC2, 0x31, 0x00, 0x00, 0x1E,
      // DTD 2 - 4K30
      0x02, 0x3A, 0x80, 0x18, 0x71, 0x38, 0x2D, 0x40,
      0x58, 0x2C, 0x45, 0x00, 0x20, 0xC2, 0x31, 0x00, 0x00, 0x1E,
      // Display Range Limits
      0x00, 0x00, 0x00, 0xFD, 0x00, 0x18, 0x4B, 0x0F,
      0x88, 0x78, 0x00, 0x0A, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
      // Display Product Name
      0x00, 0x00, 0x00, 0xFC, 0x00, 0x4C, 0x47, 0x20,
      0x4F, 0x4C, 0x45, 0x44, 0x20, 0x43, 0x39, 0x0A, 0x20, 0x20,
      0x01, 0x5E                                      // 1 extension, checksum
    ],
    expectedResults: {
      manufacturer: 'LGD',
      productCode: 0x5A77,
      edidVersion: '1.4',
      maxImageSize: { horizontal: 60, vertical: 34 },
      supportsHDR: true,
      supportsDolbyVision: true,
      supportsVRR: true,
      hasWideColorGamut: true
    }
  },

  // Simple 1080p monitor for basic testing
  basic1080pMonitor: {
    description: 'Basic 1080p monitor - simple test case',
    block0: [
      0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
      0x22, 0xF0, 0x76, 0x26, 0x01, 0x01, 0x01, 0x01, // Generic manufacturer
      0x1E, 0x1B, 0x01, 0x03,                         // Week 30 of 2017, EDID 1.3
      0x80, 0x30, 0x1B, 0x78,                         // Digital, 48x27 cm, gamma 2.20
      0xEE, 0xEE, 0x91, 0xA3, 0x54, 0x4C, 0x99, 0x26, 0x0F, 0x50, 0x54, // Standard chromaticity
      0x21, 0x08, 0x00,                               // Established timings
      0xD1, 0xC0, 0x81, 0xC0, 0x81, 0x80, 0x95, 0x00, // Standard timings
      0xA9, 0xC0, 0xB3, 0x00, 0x01, 0x01, 0x01, 0x01,
      // DTD 1 - 1920x1080 60Hz
      0x02, 0x3A, 0x80, 0x18, 0x71, 0x38, 0x2D, 0x40,
      0x58, 0x2C, 0x45, 0x00, 0xDD, 0x0C, 0x11, 0x00, 0x00, 0x1E,
      // DTD 2 - 1280x1024 75Hz  
      0xD0, 0x09, 0x80, 0xA0, 0x20, 0xE0, 0x2D, 0x10,
      0x10, 0x60, 0xA2, 0x00, 0xDD, 0x0C, 0x11, 0x00, 0x00, 0x1E,
      // Display Range Limits
      0x00, 0x00, 0x00, 0xFD, 0x00, 0x38, 0x4C, 0x1E,
      0x53, 0x0E, 0x00, 0x0A, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
      // Display Product Name
      0x00, 0x00, 0x00, 0xFC, 0x00, 0x42, 0x61, 0x73,
      0x69, 0x63, 0x20, 0x4D, 0x6F, 0x6E, 0x69, 0x74, 0x6F, 0x72,
      0x00, 0x00                                      // No extensions, checksum
    ],
    expectedResults: {
      manufacturer: 'HWP', // HP-like
      productCode: 0x2676,
      edidVersion: '1.3',
      maxImageSize: { horizontal: 48, vertical: 27 },
      maxRefreshRate: 75,
      numberOfExtensions: 0
    }
  },

  // Test helper functions
  createFullEdidArray: function(testData) {
    var fullEdid = [];
    
    // Add block 0
    for (var i = 0; i < testData.block0.length; i++) {
      fullEdid.push(testData.block0[i]);
    }
    
    // Add block 1 if it exists
    if (testData.block1) {
      for (var i = 0; i < testData.block1.length; i++) {
        fullEdid.push(testData.block1[i]);
      }
    }
    
    return fullEdid;
  },

  // Utility to fix checksums
  calculateChecksum: function(block) {
    var sum = 0;
    for (var i = 0; i < 127; i++) {
      sum += block[i];
    }
    return (256 - (sum % 256)) % 256;
  },

  // Apply correct checksums to test data
  fixChecksums: function(testData) {
    var fixed = JSON.parse(JSON.stringify(testData)); // Deep copy
    
    // Fix block 0 checksum
    if (fixed.block0) {
      fixed.block0[127] = this.calculateChecksum(fixed.block0);
    }
    
    // Fix block 1 checksum if it exists
    if (fixed.block1) {
      fixed.block1[127] = this.calculateChecksum(fixed.block1);
    }
    
    return fixed;
  }
};

// Export for Node.js testing if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EdidTestData;
}