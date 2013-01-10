function Edid () {
  this.EDID_BLOCK_LENGTH = 128; 
  this.WhiteAndSyncLevels = ["+0.7/−0.3 V", "+0.714/−0.286 V",
                               "+1.0/−0.4 V", "+0.7/0 V"];
  this.digitalColorSpace = ["RGB 4:4:4", "RGB 4:4:4 + YCrCb 4:4:4",
                              "RGB 4:4:4 + YCrCb 4:2:2",
                              "RGB 4:4:4 + YCrCb 4:4:4 + YCrCb 4:2:2"];
  this.analogColorSpace = ["Monochrome or Grayscale", 
                            "RGB color", "Non-RGB color", "Undefined"];
  this.establishedTimingBitmaps = ["720×400 @ 70 Hz",
                                    "720×400 @ 88 Hz",
                                    "640×480 @ 60 Hz",
                                    "640×480 @ 67 Hz",
                                    "640×480 @ 72 Hz",
                                    "640×480 @ 75 Hz",
                                    "800×600 @ 56 Hz",
                                    "800×600 @ 60 Hz",
                                    "800×600 @ 72 Hz",
                                    "800×600 @ 75 Hz",
                                    "832×624 @ 75 Hz",
                                    "1024×768i @ 87 Hz",
                                    "1024×768 @ 60 Hz",
                                    "1024×768 @ 72 Hz",
                                    "1024×768 @ 75 Hz",
                                    "1280×1024 @ 75 Hz",
                                    "1152x870 @ 75 Hz"];
                                    
  this.xyPixelRatioEnum = [{"string":"16:10"},
                           {"string":"4:3"},
                           {"string":"5:4"},
                           {"string":"16:9"}];
  
  this.syncTypeEnum = {"ANALOG_COMPOSITE" : 0x00,
                    "BIPOLAR_ANALOG_COMPOSITE" : 0x01,
                      "DIGITAL_COMPOSITE" : 0x02,
                      "DIGITAL_SEPARATE" : 0x03};
}

Edid.prototype.setEdidData = function(edid)
{
  this.edidData = edid;  
}

Edid.prototype.parse = function()
{
  if(this.validateHeader() == true)
  {
    this.validHeader = "OK";  
  } 
  else
  {
    this.validHeader = "ERROR";
  }   
    
  this.eisaId = this.getEisaId();
  
  this.productCode = this.getProductCode();
  
  this.serialNumber = this.getSerialNumber();

  this.manufactureDate = this.getManufactureWeek()+"/"+
                              this.getManufactureYear();
  
  this.edidVersion = this.getEdidVersion()+"."+
                          this.getEdidRevision();

  this.bdp = this.getBasicDisplayParams();
  
  this.chromaticity = this.getChromaticityCoordinates();
  
  this.timingBitmap = this.getTimingBitmap();

  this.standardDisplayModes = this.getStandardDisplayModes();
  
  this.dtds = this.getDtds();
  
  this.numberOfExtensions = this.getNumberExtensions();

  this.checksum = this.getChecksum();

  this.exts = new Array();  
  // Begin Parsing Extension blocks
  for(var extIndex = 0; extIndex < this.numberOfExtensions; extIndex++)
  {
    this.exts[extIndex] = new Object();
    this.exts[extIndex].extTag = this.getExtTag(extIndex);
    this.exts[extIndex].revisionNumber = this.getRevisionNumber(extIndex);
    this.exts[extIndex].dtdStart = this.getDtdStart(extIndex);
    this.exts[extIndex].numDtds = this.getNumberExtDtds(extIndex);
    this.exts[extIndex].underscan = this.getUnderscan(extIndex);
    this.exts[extIndex].basicAudio = this.getBasicAudio(extIndex);
    this.exts[extIndex].ycbcr444 = this.getYcBcR444(extIndex);
    this.exts[extIndex].ycbcr422 = this.getYcBcR422(extIndex);

  }
}

Edid.prototype.validateHeader = function()
{
  var validHeader = new Boolean();
  if ((this.edidData[0] == 0x00) &&
        (this.edidData[1] == 0xFF) &&
        (this.edidData[2] == 0xFF) &&
        (this.edidData[3] == 0xFF) &&
        (this.edidData[4] == 0xFF) &&
        (this.edidData[5] == 0xFF) &&
        (this.edidData[6] == 0xFF) &&
        (this.edidData[7] == 0x00))
  {
    validHeader = true;
  }
  else
  {
    validHeader = false;
  }
  return validHeader;
}

Edid.prototype.getEisaId = function()
{
  var FIVE_BIT_LETTER_MASK = 0x1F;
  var EISA_ID_BYTE1 = 8;
  var EISA_ID_BYTE2 = 9;
  var EISA_LETTER1_OFF = 2
  var EISA_LETTER2_OFF = 5;
  var LETTER2_TOP_BYTES = 2;
  var LETTER2_TOP_MASK = 0x03;  
  var LETTER2_BOT_MASK = 0x07;
  
  var firstLetter = (this.edidData[EISA_ID_BYTE1] >> EISA_LETTER1_OFF) &
                                            FIVE_BIT_LETTER_MASK;
  
  // Get the first two bits [2:0] of the top byte
  var secondLetterTop = this.edidData[EISA_ID_BYTE1] & LETTER2_TOP_MASK;
  // Get the last three bits [7:5] of the bottom byte 
  var secondLetterBottom = (this.edidData[EISA_ID_BYTE2] >> EISA_LETTER2_OFF) &
                                            LETTER2_BOT_MASK;
  // Combine the top and bottom
  var secondLetter = (secondLetterTop << LETTER2_TOP_BYTES) | secondLetterBottom;
  
  var thirdLetter = this.edidData[EISA_ID_BYTE2] & FIVE_BIT_LETTER_MASK;
  
  return intToAscii(firstLetter)+intToAscii(secondLetter)+intToAscii(thirdLetter);
}

function intToAscii(intCode)
{
    var abc = "0ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return abc[intCode];
}

Edid.prototype.getProductCode = function()
{
  var PRODUCT_CODE1 = 10;
  var PRODUCT_CODE2 = 11;
  
   return this.edidData[PRODUCT_CODE2] << 8 |
                 this.edidData[PRODUCT_CODE1];
}


Edid.prototype.getSerialNumber = function()
{
  var SERIAL_NUMBER1 = 12;
  var SERIAL_NUMBER2 = 13;
  var SERIAL_NUMBER3 = 14;
  var SERIAL_NUMBER4 = 15;
  
  return  this.edidData[SERIAL_NUMBER4] << 24 |
                          this.edidData[SERIAL_NUMBER3] << 16 |
                          this.edidData[SERIAL_NUMBER2] << 8 |
                          this.edidData[SERIAL_NUMBER1];
}

Edid.prototype.getManufactureWeek = function()
{
  var MANUFACTURE_WEEK = 16;
  return this.edidData[MANUFACTURE_WEEK];
}

Edid.prototype.getManufactureYear = function()
{
  var MANUFACTURE_YEAR = 17;
  return this.edidData[MANUFACTURE_YEAR] + 1990;
}

Edid.prototype.getEdidVersion = function()
{
  var EDID_VERSION = 18;
  return this.edidData[EDID_VERSION];
}

Edid.prototype.getEdidRevision = function()
{
  var EDID_REVISION = 19;
  return this.edidData[EDID_REVISION];
}

Edid.prototype.getBasicDisplayParams = function()
{
  var bdp = new Object();
  
  var VIDEO_IN_PARAMS_BITMAP = 20;
  var DIGITAL_INPUT = 0x80;
  if(this.edidData[VIDEO_IN_PARAMS_BITMAP] & DIGITAL_INPUT)
  {
    var VESA_DFP_COMPATIBLE = 0x01;
    bdp.digitalInput = true;
    if(this.edidData[VIDEO_IN_PARAMS_BITMAP] & VESA_DFP_COMPATIBLE)
    {
      bdp.vesaDfpCompatible = true;
    }
    else
    {
      bdp.vesaDfpCompatible = false;
    }
  }
  else
  {
    bdp.digitalInput = false;
    
    var WHITE_SYNC_LVLS_OFF = 5;
    var WHITE_SYNC_LVLS_MASK = 0x03
    bdp.whiteSyncLevels =  (this.edidData[VIDEO_IN_PARAMS_BITMAP] >> 
                                WHITE_SYNC_LVLS_OFF) & WHITE_SYNC_LVLS_MASK;
  
    var BLANK_TO_BLACK_OFF = 4;
    var BLANK_TO_BLACK_MASK = 0x01;
    bdp.blankToBlack = ((this.edidData[VIDEO_IN_PARAMS_BITMAP] >> 
                                BLANK_TO_BLACK_OFF) & BLANK_TO_BLACK_MASK) ?
                                true : false;
                                
    var SEPARATE_SYNC_OFF = 3;
    var SEPARATE_SYNC_MASK = 0x01;
    bdp.separateSyncSupported = ((this.edidData[VIDEO_IN_PARAMS_BITMAP] >> 
                                SEPARATE_SYNC_OFF) & SEPARATE_SYNC_MASK) ?
                                true : false;
        
    var COMPOSITE_SYNC_OFF = 2;
    var COMPOSITE_SYNC_MASK = 0x01;
    bdp.compositeSyncSupported = ((this.edidData[VIDEO_IN_PARAMS_BITMAP] >> 
                                COMPOSITE_SYNC_OFF) & COMPOSITE_SYNC_MASK) ?
                                true : false;
    
    var SYNC_ON_GREEN_OFF = 1;
    var SYNC_ON_GREEN_MASK = 0x01;
    bdp.synOnGreen = ((this.edidData[VIDEO_IN_PARAMS_BITMAP] >> 
                                SYNC_ON_GREEN_OFF) & SYNC_ON_GREEN_MASK) ?
                                true : false;
  
    var VSYNC_SERRATED_MASK = 0x01;
    bdp.vsyncSerrated = (this.edidData[VIDEO_IN_PARAMS_BITMAP] & VSYNC_SERRATED_MASK) ?
                                true : false;
  }
  var MAX_HOR_IMG_SIZE = 21;
  bdp.maxHorImgSize = this.edidData[MAX_HOR_IMG_SIZE];
  
  var MAX_VERT_IMG_SIZE = 22;
  bdp.maxVertImgSize = this.edidData[MAX_VERT_IMG_SIZE];

  var DISPLAY_GAMMA = 23;
  bdp.displayGamma = (this.edidData[DISPLAY_GAMMA] * (2.54/255)) + 1;

  var SUPPORTED_FEATURES_BITMAP = 24;
  var DPMS_STANDBY = 0x80;
  bdp.dpmsStandby = (this.edidData[SUPPORTED_FEATURES_BITMAP] & DPMS_STANDBY) ?
                                true : false;
  var DPMS_SUSPEND = 0x40;                              
  bdp.dpmsSuspend = (this.edidData[SUPPORTED_FEATURES_BITMAP] & DPMS_SUSPEND) ?
                                true : false;             
  var DPMS_ACTIVE_OFF = 0x20;
  bdp.dpmsActiveOff = (this.edidData[SUPPORTED_FEATURES_BITMAP] & DPMS_ACTIVE_OFF) ?
                                true : false;                     
  var DISPLAY_TYPE_OFF = 3;
  var DISPLAY_TYPE_MASK = 0x03; 
  bdp.displayType = (this.edidData[SUPPORTED_FEATURES_BITMAP] >> DISPLAY_TYPE_OFF) &
                                   DISPLAY_TYPE_MASK;
  
  var STANDARD_SRGB = 0x04;
  bdp.standardSRgb = (this.edidData[SUPPORTED_FEATURES_BITMAP] & STANDARD_SRGB) ?
                                true : false;
  var PREFERRED_TIMING = 0x02;
  bdp.preferredTiming = (this.edidData[SUPPORTED_FEATURES_BITMAP] & PREFERRED_TIMING) ?
                                true : false;
  var GTF_SUPPORTED = 0x01;
  bdp.gtfSupported = (this.edidData[SUPPORTED_FEATURES_BITMAP] & GTF_SUPPORTED) ?
                                true : false;
  return bdp;
}

Edid.prototype.getChromaticityCoordinates = function()
{
  var chromaticity = new Object();
  var TWO_BIT_MASK = 0x03;
  var TWO_BIT_OFF = 2;
  var FOUR_BIT_OFF = 4;
  var SIX_BIT_OFF = 6;

  var RED_GREEN_LSB = 25;
  var RED_X_MSB = 27;
  chromaticity.redX = (this.edidData[RED_X_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[RED_GREEN_LSB] >> SIX_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.redXCoords = (chromaticity.redX / 1024);
  
  var RED_Y_MSB = 28;
  chromaticity.redY = (this.edidData[RED_Y_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[RED_GREEN_LSB] >> FOUR_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.redYCoords = (chromaticity.redY / 1024);

  var GREEN_X_MSB = 29;  
  chromaticity.greenX = (this.edidData[GREEN_X_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[RED_GREEN_LSB] >> TWO_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.greenXCoords = (chromaticity.greenX / 1024);

  var GREEN_Y_MSB = 30;
  chromaticity.greenY = (this.edidData[GREEN_Y_MSB] << TWO_BIT_OFF) |
                      (this.edidData[RED_GREEN_LSB] & TWO_BIT_MASK);
  chromaticity.greenYCoords = (chromaticity.greenY / 1024);

  var BLUE_WHITE_LSB = 26;
  var BLUE_X_MSB = 31;  
  chromaticity.blueX = (this.edidData[BLUE_X_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[BLUE_WHITE_LSB] >> SIX_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.blueXCoords = (chromaticity.blueX / 1024);
  
  var BLUE_Y_MSB = 32;
  chromaticity.blueY = (this.edidData[BLUE_Y_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[BLUE_WHITE_LSB] >> FOUR_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.blueYCoords = (chromaticity.blueY / 1024);

  var WHITE_X_MSB = 33;
  chromaticity.whiteX = (this.edidData[WHITE_X_MSB] << TWO_BIT_OFF) |
                      ((this.edidData[BLUE_WHITE_LSB] >> TWO_BIT_OFF) & TWO_BIT_MASK);
  chromaticity.whiteXCoords = (chromaticity.whiteX / 1024);
                      
  var WHITE_Y_MSB = 34;
  chromaticity.whiteY = (this.edidData[WHITE_Y_MSB] << TWO_BIT_OFF) |
                      (this.edidData[BLUE_WHITE_LSB] & TWO_BIT_MASK);
  chromaticity.whiteYCoords = (chromaticity.whiteY / 1024);
  
  return chromaticity;
}

Edid.prototype.getTimingBitmap = function()
{
  var TIMING_BITMAP1 = 35;
  var TIMING_BITMAP2 = 36;
  var TIMING_BITMAP3 = 37;
  
  var timingBitmap = (this.edidData[TIMING_BITMAP1] << 16) |
                      (this.edidData[TIMING_BITMAP2] << 8) |
                      this.edidData[TIMING_BITMAP3];
  return timingBitmap;
}

Edid.prototype.getStandardDisplayModes = function()
{
  var STD_DISPLAY_MODES_START = 38;
  var STD_DISPLAY_MODES_END = 53;
  
  var stdDispModesArray = new Array();
  var arrayCounter = 0;
  var index = STD_DISPLAY_MODES_START;
  while(index < STD_DISPLAY_MODES_END)
  {
    if((this.edidData[index] != 0x01) &&
          (this.edidData[index+1] != 0x01))
    {
      var standardDisplayModes = new Object();
      standardDisplayModes.xResolution = (this.edidData[index] + 31) * 8;
      
      var XY_PIXEL_RATIO_OFF = 6;
      var XY_PIXEL_RATIO_MASK = 0x03;
      standardDisplayModes.xyPixelRatio = (this.edidData[index+1] >>
                                        XY_PIXEL_RATIO_OFF) & XY_PIXEL_RATIO_MASK;
      
      var VERTICAL_FREQUENCY_MASK = 0x3F;
      standardDisplayModes.vertFreq = (this.edidData[index+1] & 
                                        VERTICAL_FREQUENCY_MASK) + 60;
      
      stdDispModesArray[arrayCounter] = standardDisplayModes;
      arrayCounter++;
    }
    index += 2;
  }
  return stdDispModesArray;
}

Edid.prototype.getDtds = function()
{
  var dtdArray = new Array();
  var dtdCounter = 0;
  
  var DTD_START = 54;
  var DTD_END = 125;
  var DTD_LENGTH = 18;
  
  var dtdIndex = DTD_START;
  
  // While the pixel clock is not equal to zero and
  // the DTD index is less than the last byte of the DTD
  while(((this.edidData[dtdIndex] != 0) || (this.edidData[dtdIndex+1] != 0))
                                && (dtdIndex < DTD_END))
  {
    var dtd = new Object();

    // Pixel Clock in MHz
    dtd.pixelClock = ((this.edidData[dtdIndex+1] << 8) |
                           this.edidData[dtdIndex]) / 100;
    
    var HOR_ACTIVE_OFF = 4;
    var HOR_ACTIVE_PIX_MASK = 0x0F;
    dtd.horActivePixels = (((this.edidData[dtdIndex+4] >> HOR_ACTIVE_OFF) & HOR_ACTIVE_PIX_MASK) << 8) |
                                this.edidData[dtdIndex+2];
                      
    var HOR_BLANK_MASK = 0x0F          
    dtd.horBlankPixels = (((this.edidData[dtdIndex+4])
                             & HOR_BLANK_MASK) << 8) | this.edidData[dtdIndex+3];
                             
    var VERT_ACTIVE_OFF = 4;
    var VERT_ACTIVE_MASK = 0x0F;
    dtd.vertActivePixels = (((this.edidData[dtdIndex+7] >> VERT_ACTIVE_OFF) &
                                     VERT_ACTIVE_MASK) << 8) | this.edidData[dtdIndex+5];;
    var VERT_BLANK_MASK = 0x0F;
    dtd.vertBlankPixels = ((this.edidData[dtdIndex+7] & VERT_BLANK_MASK)  << 8)
                                                       | this.edidData[dtdIndex+6];
    
    var HOR_SYNC_OFF_OFF = 6;
    var HOR_SYNC_OFF_MASK = 0x03;
    dtd.horSyncOff = (((this.edidData[dtdIndex+11] >> HOR_SYNC_OFF_OFF)
                             & HOR_SYNC_OFF_MASK) << 8) | this.edidData[dtdIndex+8];
    
    var HOR_SYNC_PULSE_OFF = 4;
    var HOR_SYNC_PULSE_MASK = 0x03;
    dtd.horSyncPulse = (((this.edidData[dtdIndex+11] >> HOR_SYNC_PULSE_OFF)
                             & HOR_SYNC_PULSE_MASK) << 8)| this.edidData[dtdIndex+9];
    
    var VERT_SYNC_OFF_TOP_OFF = 2;
    var VERT_SYNC_OFF_TOP_MASK = 0x03;
    var VERT_SYNC_OFF_BOT_OFF = 4;
    var VERT_SYNC_OFF_BOT_MASK = 0x0F;
    dtd.vertSyncOff = (((this.edidData[dtdIndex+11] >> VERT_SYNC_OFF_TOP_OFF)
                             & VERT_SYNC_OFF_TOP_MASK) << 4) | 
                      ((this.edidData[dtdIndex+10] >> VERT_SYNC_OFF_BOT_OFF) &
                      VERT_SYNC_OFF_BOT_MASK);
    
    var VERT_SYNC_PULSE_TOP_MASK = 0x03;
    var VERT_SYNC_PULSE_BOT_MASK = 0x0F;
    dtd.vertSyncPulse = ((this.edidData[dtdIndex+11] & VERT_SYNC_PULSE_TOP_MASK)
                          << 4) | (this.edidData[dtdIndex+10] & VERT_SYNC_PULSE_BOT_MASK);
    
    var HOR_DISPLAY_TOP_OFF = 4;
    var HOR_DISPLAY_TOP_MASK = 0x0F;
    dtd.horDisplaySize = (((this.edidData[dtdIndex+14] >> HOR_DISPLAY_TOP_OFF)
                             & HOR_DISPLAY_TOP_MASK) << 8) | this.edidData[dtdIndex+12];
    
    var VERT_DISPLAY_TOP_MASK = 0x0F;
    dtd.vertDisplaySize = ((this.edidData[dtdIndex+14] & VERT_DISPLAY_TOP_MASK) << 8)
                                               | this.edidData[dtdIndex+13];
    
    dtd.horBorderPixels = this.edidData[dtdIndex+15] * 2;
    
    dtd.vertBorderLines = this.edidData[dtdIndex+16] * 2;
    
    var INTERLACED_MASK = 0x80;
    dtd.interlaced = (this.edidData[dtdIndex+17] & INTERLACED_MASK) ? true : false;
    
    var STEREO_MODE_OFFSET = 5;
    var STEREO_MODE_MASK = 0x03;
    dtd.stereoMode = ((this.edidData[dtdIndex+17] >> STEREO_MODE_OFFSET) &
                                                     STEREO_MODE_MASK);
    

    var SYNC_TYPE_OFFSET = 3;
    var SYNC_TYPE_MASK = 0x03;
    dtd.syncType = ((this.edidData[dtdIndex+17] >> SYNC_TYPE_OFFSET) &
                                                     SYNC_TYPE_MASK);
    // Bit is dependent on sync type
    if(dtd.syncType == this.syncTypeEnum.DIGITAL_SEPARATE)
    {
      var VSYNC_POLARITY_MASK = 0x04; 
      dtd.vSyncPolarity = (this.edidData[dtdIndex+17] & 
                              VSYNC_POLARITY_MASK) ? true : false;
    }
    else
    {
      var VSYNC_SERRATED_MASK = 0x04;
      dtd.vSyncSerrated = (this.edidData[dtdIndex+17] & 
                              VSYNC_SERRATED_MASK) ? true : false;
    }
    
    // Bit is dependent on syn type
    if((dtd.syncType == this.syncTypeEnum.ANALOG_COMPOSITE) ||
                     (dtd.syncType == this.syncTypeEnum.BIPOLAR_ANALOG_COMPOSITE))
    {
      var SYNC_ALL_RGB_MASK = 0x02;
      dtd.syncAllRGBLines = (this.edidData[dtdIndex+17] & 
                              SYNC_ALL_RGB_MASK) ? true : false;
    }
    else
    {
      var HSYNC_POLARY_MASK = 0x02;
      dtd.hSyncPolarity = (this.edidData[dtdIndex+17] & 
                              HSYNC_POLARY_MASK) ? true : false;
    }
    var TWO_WAY_STEREO_MASK = 0x01;
    dtd.twoWayStereo = (this.edidData[dtdIndex+17] & TWO_WAY_STEREO_MASK) ? true : false;
    
    // Add DTD to the DTD Array
    dtdArray[dtdCounter] = dtd;
    // Increment DTD Counter
    dtdCounter++;
    // Add a DTD length, to go to the next descriptor
    dtdIndex += DTD_LENGTH;
  }
  return dtdArray;
}

Edid.prototype.getNumberExtensions = function()
{
  var NUMBER_OF_EXTENSIONS = 126;
  return this.edidData[NUMBER_OF_EXTENSIONS];
}

Edid.prototype.getChecksum = function()
{
  var CHECKSUM = 127;
  return this.edidData[CHECKSUM];
}

Edid.prototype.calcChecksum = function(block)
{
  var startAddress = block * this.EDID_BLOCK_LENGTH;
  var endAddress = startAddress + this.EDID_BLOCK_LENGTH - 1;
  var checksum = 0;
  for(var index = startAddress; index < endAddress; index++)
  {
    checksum += this.edidData[index];
  }
  return (256- (checksum % 256));
}

Edid.prototype.validChecksum = function(block)
{
  var checksum = this.edidData[((block+1) * this.EDID_BLOCK_LENGTH) - 1];
  var calculatedChecksum = this.calcChecksum(block);
  var validChecksum =  new Boolean();
  
  if(checksum == calculatedChecksum)
  {
    validChecksum = true;
  }
  else
  {
    validChecksum = false;
  }
  return validChecksum;
}

Edid.prototype.getExtTag = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var EXT_TAG = BLOCK_OFFSET + 0;
  return this.edidData[EXT_TAG];
}

Edid.prototype.getRevisionNumber = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var REV_NUMBER = BLOCK_OFFSET + 1;
  return this.edidData[REV_NUMBER];
}

Edid.prototype.getDtdStart = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var DTD_START = BLOCK_OFFSET + 2;
  return this.edidData[DTD_START];
}

Edid.prototype.getNumberExtDtds = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var NUM_DTDS = BLOCK_OFFSET + 3;
  var NUM_DTDS_MASK = 0x0F;
  return (this.edidData[NUM_DTDS] & NUM_DTDS_MASK); 
}

Edid.prototype.getUnderscan = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var UNDERSCAN = BLOCK_OFFSET + 3;
  var UNDERSCAN_MASK = 0x80;
  return (this.edidData[UNDERSCAN] & UNDERSCAN_MASK)?true:false; 
}

Edid.prototype.getBasicAudio = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var BASIC_AUDIO = BLOCK_OFFSET + 3;
  var BASIC_AUDIO_MASK = 0x40;
  return (this.edidData[BASIC_AUDIO] & BASIC_AUDIO_MASK)?true:false; 
}

Edid.prototype.getYcBcR444 = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var YCBCR_444 = BLOCK_OFFSET + 3;
  var YCBCR_444_MASK = 0x20;
  return (this.edidData[YCBCR_444] & YCBCR_444_MASK)?true:false; 
}

Edid.prototype.getYcBcR422 = function(extIndex)
{
  var BLOCK_OFFSET = this.EDID_BLOCK_LENGTH * (extIndex+1);
  var YCBCR_422 = BLOCK_OFFSET + 3;
  var YCBCR_422_MASK = 0x10;
  return (this.edidData[YCBCR_422] & YCBCR_422_MASK)?true:false; 
}