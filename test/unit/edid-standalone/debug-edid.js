/* Debug script to understand actual EDID parser behavior */

describe('EDID Parser Debug', function() {
  var edid;

  beforeEach(function() {
    edid = new Edid();
  });

  it('should debug basic EDID parsing', function() {
    // Test EDID with Samsung manufacturer ID (0x4C2D = SAM)
    var testEdid = [
      0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, // Header
      0x4C, 0x2D, 0x40, 0x70, 0x01, 0x00, 0x00, 0x00, // Samsung, model 0x7040, serial 1
      0x19, 0x21, 0x01, 0x04,                         // Week 25, 2023, EDID 1.4
      0x95, 0x3C, 0x22, 0x78, 0x0E,                   // Digital, 60x34cm, gamma 2.20, features
      0x91, 0xA3, 0x54, 0x4C, 0x99, 0x26, 0x0F, 0x50, 0x54, // Chromaticity
      0x21, 0x08, 0x00,                               // Established timings
      0xD1, 0xC0, 0xA9, 0xC0, 0x81, 0xC0, 0x01, 0x01, // Standard timings
      0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
      // DTD 1 - 1920x1080 60Hz (pixel clock = 14850 = 148.5MHz)
      0x02, 0x3A, 0x80, 0x18, 0x71, 0x38, 0x2D, 0x40,
      0x58, 0x2C, 0x45, 0x00, 0x58, 0x54, 0x21, 0x00, 0x00, 0x1E,
    ].concat(new Array(54).fill(0));
    
    // Calculate checksum
    var sum = 0;
    for (var i = 0; i < 127; i++) {
      sum += testEdid[i];
    }
    testEdid[127] = (256 - (sum % 256)) % 256;
    testEdid[126] = 0; // No extensions
    
    edid.setEdidData(testEdid);
    
    // Debug outputs
    console.log('=== EDID Debug Info ===');
    console.log('Header valid:', edid.validateHeader());
    console.log('EISA ID:', edid.getEisaId());
    console.log('Product Code:', '0x' + edid.getProductCode().toString(16));
    console.log('Serial Number:', edid.getSerialNumber());
    console.log('Manufacture Week:', edid.getManufactureWeek());
    console.log('Manufacture Year:', edid.getManufactureYear());
    console.log('EDID Version:', edid.getEdidVersion() + '.' + edid.getEdidRevision());
    
    var bdp = edid.getBasicDisplayParams();
    console.log('Digital Input:', bdp.digitalInput);
    console.log('Max H/V Size:', bdp.maxHorImgSize + 'x' + bdp.maxVertImgSize);
    console.log('Gamma:', bdp.displayGamma);
    
    var chrom = edid.getChromaticityCoordinates();
    console.log('Red X/Y:', chrom.redXCoords.toFixed(4) + '/' + chrom.redYCoords.toFixed(4));
    console.log('Green X/Y:', chrom.greenXCoords.toFixed(4) + '/' + chrom.greenYCoords.toFixed(4));
    console.log('Blue X/Y:', chrom.blueXCoords.toFixed(4) + '/' + chrom.blueYCoords.toFixed(4));
    console.log('White X/Y:', chrom.whiteXCoords.toFixed(4) + '/' + chrom.whiteYCoords.toFixed(4));
    
    console.log('Timing Bitmap:', '0x' + edid.getTimingBitmap().toString(16));
    console.log('Number of Extensions:', edid.getNumberExtensions());
    console.log('Checksum:', '0x' + edid.getChecksum().toString(16));
    console.log('Calculated Checksum:', '0x' + edid.calcChecksum(0).toString(16));
    console.log('Valid Checksum:', edid.validChecksum(0));
    
    // Parse DTDs
    var dtds = edid.getDtds();
    console.log('Number of DTDs:', dtds.length);
    if (dtds.length > 0) {
      var dtd = dtds[0];
      console.log('DTD 1 - Pixel Clock:', dtd.pixelClock);
      console.log('DTD 1 - H Active:', dtd.horActivePixels);
      console.log('DTD 1 - V Active:', dtd.vertActivePixels);
      console.log('DTD 1 - H Blank:', dtd.horBlankPixels);
      console.log('DTD 1 - V Blank:', dtd.vertBlankPixels);
    }
    
    // Run full parse to see what happens
    edid.parse();
    console.log('=== After Full Parse ===');
    console.log('Valid Header:', edid.validHeader);
    console.log('EISA ID:', edid.eisaId);
    console.log('Product Code:', edid.productCode);
    console.log('EDID Version:', edid.edidVersion);
    console.log('Extensions:', edid.numberOfExtensions);
    console.log('DTDs:', edid.dtds ? edid.dtds.length : 'undefined');
    
    // Basic assertions - we'll update these based on debug output
    expect(edid.validateHeader()).toBe(true);
    expect(edid.getEisaId()).toBe('SAM');
    expect(edid.getProductCode()).toBe(0x7040);
  });

  it('should debug checksum calculation', function() {
    // Simple test for checksum calculation
    var testData = new Array(128).fill(0);
    testData[0] = 0x00; testData[1] = 0xFF; testData[2] = 0xFF; testData[3] = 0xFF;
    testData[4] = 0xFF; testData[5] = 0xFF; testData[6] = 0xFF; testData[7] = 0x00;
    // Sum of first 8 bytes = 0x00 + 0xFF*6 + 0x00 = 1530 (0x5FA)
    // For full 127 bytes with rest as 0, sum = 1530
    // Checksum = 256 - (1530 % 256) = 256 - 250 = 6
    testData[127] = 6;
    
    edid.setEdidData(testData);
    var calculatedChecksum = edid.calcChecksum(0);
    console.log('Expected checksum: 6, Calculated:', calculatedChecksum);
    console.log('Valid checksum:', edid.validChecksum(0));
    
    expect(calculatedChecksum).toBe(6);
    expect(edid.validChecksum(0)).toBe(true);
  });
});