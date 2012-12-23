function Edid (stringEdid) {
  //this.edidData = new Array();
  //var bdp = new Object();

  // Convert to integer array
  this.edidData = convertToIntArray(stringEdid);  
  this.WhiteAndSyncLevels = ["+0.7/−0.3 V", "+0.714/−0.286 V",
                               "+1.0/−0.4 V", "+0.7/0 V"]
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
    bdp.blankToBlack = (this.edidData[VIDEO_IN_PARAMS_BITMAP] >> 
                                BLANK_TO_BLACK_OFF) & BLANK_TO_BLACK_MASK;
                                
    var SEPARATE_SYNC_OFF = 3;
    var SEPARATE_SYNC_MASK = 0x01;
    bdp.separateSyncSupported = (this.edidData[VIDEO_IN_PARAMS_BITMAP] >> 
                                SEPARATE_SYNC_OFF) & SEPARATE_SYNC_MASK;
        
    var COMPOSITE_SYNC_OFF = 2;
    var COMPOSITE_SYNC_MASK = 0x01;
    bdp.compositeSyncSupported = (this.edidData[VIDEO_IN_PARAMS_BITMAP] >> 
                                COMPOSITE_SYNC_OFF) & COMPOSITE_SYNC_MASK;
    
    var SYNC_ON_GREEN_OFF = 1;
    var SYNC_ON_GREEN_MASK = 0x01;
    bdp.synOnGreen = (this.edidData[VIDEO_IN_PARAMS_BITMAP] >> 
                                SYNC_ON_GREEN_OFF) & SYNC_ON_GREEN_MASK;                                                    
  
    var VSYNC_SERRATED_MASK = 0x01;
    bdp.vsyncSerrated = this.edidData[VIDEO_IN_PARAMS_BITMAP] & VSYNC_SERRATED_MASK; 
  }
  return bdp;
}
