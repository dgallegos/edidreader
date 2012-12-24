function Edid () {
 
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
}

Edid.prototype.setEdidData = function(stringEdid)
{
  // Convert to integer array
  this.edidData = convertToIntArray(stringEdid);  
}

function convertToIntArray(string)
{
  var intArray = string.split(" ");
  var edidData = [];
  for(var i=0; i<intArray.length; i++) 
  { 
    edidData[i] = parseInt(intArray[i], 16);
  } 
  return edidData;
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
  bdp.displayGamma = this.edidData[DISPLAY_GAMMA];

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
  
  var timingBitmap = (this.edidData[TIMING_BITMAP3] << 16) |
                      (this.edidData[TIMING_BITMAP2] << 8) |
                      this.edidData[TIMING_BITMAP1]
  return timingBitmap;
}

