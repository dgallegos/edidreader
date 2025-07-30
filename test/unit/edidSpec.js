'use strict';

/* jasmine specs for EDID parser */

describe('EDID Parser', function() {
  var edid;

  beforeEach(function() {
    edid = new Edid();
  });

  describe('EDID Header Validation', function() {
    it('should validate correct EDID header', function() {
      var validHeader = [0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00];
      edid.setEdidData(validHeader.concat(new Array(120).fill(0)));
      expect(edid.validateHeader()).toBe(true);
    });

    it('should reject invalid EDID header', function() {
      var invalidHeader = [0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00];
      edid.setEdidData(invalidHeader.concat(new Array(120).fill(0)));
      expect(edid.validateHeader()).toBe(false);
    });

    it('should reject incomplete header', function() {
      var incompleteHeader = [0x00, 0xFF, 0xFF];
      edid.setEdidData(incompleteHeader);
      expect(edid.validateHeader()).toBe(false);
    });
  });

  describe('EISA ID Parsing', function() {
    beforeEach(function() {
      // Create a minimal valid EDID with Samsung manufacturer ID (SAM = 0x4C2D)
      var samsungEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
        0x4C, 0x2D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Samsung ID + padding
      ].concat(new Array(112).fill(0));
      edid.setEdidData(samsungEdid);
    });

    it('should parse Samsung EISA ID correctly', function() {
      expect(edid.getEisaId()).toBe('SAM');
    });
  });

  describe('Product Information', function() {
    beforeEach(function() {
      // EDID with product code 0x1234 and serial 0x56789ABC
      var productEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
        0x4C, 0x2D,                                     // Samsung ID
        0x34, 0x12,                                     // Product code (little endian)
        0xBC, 0x9A, 0x78, 0x56,                        // Serial number (little endian)
      ].concat(new Array(112).fill(0));
      edid.setEdidData(productEdid);
    });

    it('should parse product code correctly', function() {
      expect(edid.getProductCode()).toBe(0x1234);
    });

    it('should parse serial number correctly', function() {
      expect(edid.getSerialNumber()).toBe(0x56789ABC);
    });
  });

  describe('Manufacture Date', function() {
    beforeEach(function() {
      // EDID with manufacture week 25, year 2023 (2023-1990=33)
      var dateEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
        0x4C, 0x2D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // ID info
        0x19, 0x21,                                     // Week 25, Year 33 (2023)
      ].concat(new Array(110).fill(0));
      edid.setEdidData(dateEdid);
    });

    it('should parse manufacture week correctly', function() {
      expect(edid.getManufactureWeek()).toBe(25);
    });

    it('should parse manufacture year correctly', function() {
      expect(edid.getManufactureYear()).toBe(2023);
    });
  });

  describe('EDID Version', function() {
    beforeEach(function() {
      // EDID version 1.4
      var versionEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
        0x4C, 0x2D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // ID info
        0x00, 0x00,                                     // Date
        0x01, 0x04,                                     // Version 1.4
      ].concat(new Array(108).fill(0));
      edid.setEdidData(versionEdid);
    });

    it('should parse EDID version correctly', function() {
      expect(edid.getEdidVersion()).toBe(1);
    });

    it('should parse EDID revision correctly', function() {
      expect(edid.getEdidRevision()).toBe(4);
    });
  });

  describe('Basic Display Parameters', function() {
    beforeEach(function() {
      // Digital display with specific parameters
      var displayEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
        0x4C, 0x2D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // ID info
        0x00, 0x00, 0x01, 0x04,                         // Date, version
        0x95,                                           // Digital input (bit 7=1), DFP compatible (bit 0=1)
        0x3C, 0x22,                                     // Max H/V image size (60x34 cm)
        0x78,                                           // Gamma 2.20 ((120*2.54/255)+1 = 2.20)
        0x0E,                                           // Features (DPMS standby=0, suspend=0, active-off=0, display type=01, sRGB=1, preferred timing=1, GTF=0)
      ].concat(new Array(103).fill(0));
      edid.setEdidData(displayEdid);
    });

    it('should detect digital input', function() {
      var bdp = edid.getBasicDisplayParams();
      expect(bdp.digitalInput).toBe(true);
    });

    it('should detect VESA DFP compatibility', function() {
      var bdp = edid.getBasicDisplayParams();
      expect(bdp.vesaDfpCompatible).toBe(true);
    });

    it('should parse maximum image size', function() {
      var bdp = edid.getBasicDisplayParams();
      expect(bdp.maxHorImgSize).toBe(60);
      expect(bdp.maxVertImgSize).toBe(34);
    });

    it('should calculate gamma correctly', function() {
      var bdp = edid.getBasicDisplayParams();
      expect(Math.round(bdp.displayGamma * 100) / 100).toBe(2.20);
    });

    it('should parse DPMS support', function() {
      var bdp = edid.getBasicDisplayParams();
      expect(bdp.dpmsStandby).toBe(false);
      expect(bdp.dpmsSuspend).toBe(false);
      expect(bdp.dpmsActiveOff).toBe(false);
    });

    it('should detect sRGB support', function() {
      var bdp = edid.getBasicDisplayParams();
      expect(bdp.standardSRgb).toBe(true);
    });

    it('should detect preferred timing', function() {
      var bdp = edid.getBasicDisplayParams();
      expect(bdp.preferredTiming).toBe(true);
    });
  });

  describe('Chromaticity Coordinates', function() {
    beforeEach(function() {
      // EDID with specific chromaticity values
      var chromEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
        0x4C, 0x2D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // ID info
        0x00, 0x00, 0x01, 0x04, 0x95, 0x3C, 0x22, 0x78, 0x0E, // BDP
        0x91, 0xA3,                                     // Blue/White LSBs, Red/Green LSBs
        0x54, 0x4C, 0x99, 0x26, 0x0F, 0x50, 0x54,     // Chromaticity MSBs
      ].concat(new Array(96).fill(0));
      edid.setEdidData(chromEdid);
    });

    it('should parse red chromaticity coordinates', function() {
      var chrom = edid.getChromaticityCoordinates();
      expect(Math.round(chrom.redXCoords * 10000) / 10000).toBe(0.6396);
      expect(Math.round(chrom.redYCoords * 10000) / 10000).toBe(0.3300);
    });

    it('should parse green chromaticity coordinates', function() {
      var chrom = edid.getChromaticityCoordinates();
      expect(Math.round(chrom.greenXCoords * 10000) / 10000).toBe(0.2998);
      expect(Math.round(chrom.greenYCoords * 10000) / 10000).toBe(0.5996);
    });

    it('should parse blue chromaticity coordinates', function() {
      var chrom = edid.getChromaticityCoordinates();
      expect(Math.round(chrom.blueXCoords * 10000) / 10000).toBe(0.1503);
      expect(Math.round(chrom.blueYCoords * 10000) / 10000).toBe(0.0595);
    });

    it('should parse white chromaticity coordinates', function() {
      var chrom = edid.getChromaticityCoordinates();
      expect(Math.round(chrom.whiteXCoords * 10000) / 10000).toBe(0.3125);
      expect(Math.round(chrom.whiteYCoords * 10000) / 10000).toBe(0.3291);
    });
  });

  describe('Established Timings', function() {
    beforeEach(function() {
      // EDID with specific established timings (0x210800 = specific bit pattern)
      var timingEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
        0x4C, 0x2D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // ID info
        0x00, 0x00, 0x01, 0x04, 0x95, 0x3C, 0x22, 0x78, 0x0E, // BDP
        0x91, 0xA3, 0x54, 0x4C, 0x99, 0x26, 0x0F, 0x50, 0x54, // Chromaticity
        0x21, 0x08, 0x00,                               // Established timings
      ].concat(new Array(93).fill(0));
      edid.setEdidData(timingEdid);
    });

    it('should parse established timing bitmap', function() {
      var bitmap = edid.getTimingBitmap();
      expect(bitmap).toBe(0x210800);
    });
  });

  describe('Checksum Validation', function() {
    it('should calculate checksum correctly', function() {
      // Create EDID where sum of first 127 bytes = 0x100 (256), so checksum should be 0x00
      var testEdid = new Array(128).fill(0);
      testEdid[0] = 0x00; testEdid[1] = 0xFF; testEdid[2] = 0xFF; testEdid[3] = 0xFF;
      testEdid[4] = 0xFF; testEdid[5] = 0xFF; testEdid[6] = 0xFF; testEdid[7] = 0x00;
      testEdid[8] = 0x01; // Make sum of first 127 bytes = 256
      testEdid[127] = 0x00; // Checksum
      
      edid.setEdidData(testEdid);
      expect(edid.calcChecksum(0)).toBe(0x00);
    });

    it('should validate correct checksum', function() {
      var testEdid = new Array(128).fill(0);
      testEdid[0] = 0x00; testEdid[1] = 0xFF; testEdid[2] = 0xFF; testEdid[3] = 0xFF;
      testEdid[4] = 0xFF; testEdid[5] = 0xFF; testEdid[6] = 0xFF; testEdid[7] = 0x00;
      testEdid[8] = 0x01;
      testEdid[127] = 0x00;
      
      edid.setEdidData(testEdid);
      expect(edid.validChecksum(0)).toBe(true);
    });

    it('should detect invalid checksum', function() {
      var testEdid = new Array(128).fill(0);
      testEdid[0] = 0x00; testEdid[1] = 0xFF; testEdid[2] = 0xFF; testEdid[3] = 0xFF;
      testEdid[4] = 0xFF; testEdid[5] = 0xFF; testEdid[6] = 0xFF; testEdid[7] = 0x00;
      testEdid[8] = 0x01;
      testEdid[127] = 0xFF; // Wrong checksum
      
      edid.setEdidData(testEdid);
      expect(edid.validChecksum(0)).toBe(false);
    });
  });

  describe('Number of Extensions', function() {
    beforeEach(function() {
      var extEdid = new Array(128).fill(0);
      extEdid[0] = 0x00; extEdid[1] = 0xFF; extEdid[2] = 0xFF; extEdid[3] = 0xFF;
      extEdid[4] = 0xFF; extEdid[5] = 0xFF; extEdid[6] = 0xFF; extEdid[7] = 0x00;
      extEdid[126] = 0x02; // 2 extension blocks
      edid.setEdidData(extEdid);
    });

    it('should parse number of extensions correctly', function() {
      expect(edid.getNumberExtensions()).toBe(2);
    });
  });

  describe('Full EDID Parsing', function() {
    beforeEach(function() {
      // Complete minimal EDID for Samsung display
      var fullEdid = [
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
        0x4C, 0x2D, 0x40, 0x70, 0x01, 0x00, 0x00, 0x00, // Samsung, model 0x7040, serial 1
        0x19, 0x21, 0x01, 0x04,                         // Week 25, 2023, EDID 1.4
        0x95, 0x3C, 0x22, 0x78, 0x0E,                   // Digital, 60x34cm, gamma 2.20, features
        0x91, 0xA3, 0x54, 0x4C, 0x99, 0x26, 0x0F, 0x50, 0x54, // Chromaticity
        0x21, 0x08, 0x00,                               // Established timings
        0xD1, 0xC0, 0xA9, 0xC0, 0x81, 0xC0, 0x01, 0x01, // Standard timings
        0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        // DTD 1 - 1920x1080 60Hz
        0x02, 0x3A, 0x80, 0x18, 0x71, 0x38, 0x2D, 0x40,
        0x58, 0x2C, 0x45, 0x00, 0x58, 0x54, 0x21, 0x00, 0x00, 0x1E,
        // Display range limits
        0x00, 0x00, 0x00, 0xFD, 0x00, 0x32, 0x78, 0x1E,
        0x87, 0x1E, 0x00, 0x0A, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
        // Display product name
        0x00, 0x00, 0x00, 0xFC, 0x00, 0x53, 0x41, 0x4D,
        0x53, 0x55, 0x4E, 0x47, 0x0A, 0x20, 0x20, 0x20, 0x20, 0x20,
        // Display serial number
        0x00, 0x00, 0x00, 0xFF, 0x00, 0x48, 0x4E, 0x41,
        0x51, 0x31, 0x30, 0x32, 0x39, 0x34, 0x35, 0x0A, 0x20, 0x20,
        0x00, // No extensions
        0x00  // Checksum placeholder
      ];
      
      // Calculate proper checksum
      var sum = 0;
      for (var i = 0; i < 127; i++) {
        sum += fullEdid[i];
      }
      fullEdid[127] = (256 - (sum % 256)) % 256;
      
      edid.setEdidData(fullEdid);
    });

    it('should parse complete EDID successfully', function() {
      edid.parse();
      expect(edid.validHeader).toBe('OK');
      expect(edid.eisaId).toBe('SAM');
      expect(edid.productCode).toBe(0x7040);
      expect(edid.serialNumber).toBe(1);
      expect(edid.edidVersion).toBe('1.4');
      expect(edid.numberOfExtensions).toBe(0);
    });

    it('should parse DTDs correctly', function() {
      edid.parse();
      expect(edid.dtds.length).toBeGreaterThan(0);
      
      var dtd = edid.dtds[0];
      expect(dtd.pixelClock).toBe(148.5); // 14850 / 100
      expect(dtd.horActivePixels).toBe(1920);
      expect(dtd.vertActivePixels).toBe(1080);
    });
  });
});