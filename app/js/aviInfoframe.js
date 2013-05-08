function AviInfoframe ()
{
  this.scanInformationStrings = ["No Data", "Overscanned", "Underscanned", "Future"];
  this.barDataStrings = ["None", "Vertical", "Horizontal", "Vertical and Horizontal"];
  this.colorSpaceStrings = ["RGB", "YCbCr 4:2:2", "YCbCr 4:4:4", "Future"];
  this.apAspectRatioStrings = [null,null,null,null,null,null,null,null,
                                  "Same as Coded Frame", "4:3 (Center)",
                                  "16:9 (Center)", "14:9 (Center)"];
  this.cfAspectRatioStrings = ["No Data", "4:3", "16:9", "Future"];
  this.colorimetryStrings = ["No Data", "SMPTE 170M", "ITU-R 709", "Extended"];
  this.nonUniformPictureScalingStrings = ["No Known Non-Uniform Scaling",
                                            "Scaled Horizontally",
                                            "Scaled Vertically",
                                            "Scaled Horizontally and Vertically"];
  this.rgbQuantizationRangeStrings = ["Default", "Limited Range", "Full Range", "Reserved"];
  this.extendedColorimetryStrings = ["xvYCC601", "xcYCC709", "sYCC601","Adobe YCC601", "Adobe RGB"];
  this.itContentTypeStrings = ["Graphics", "Photo", "Cinema", "Game"];
  this.yccQuantizationRangeStrings = ["Limited Range", "Full Range", "Reserved", "Reserved"];
}

AviInfoframe.prototype.setAviData = function(aviInfoframe)
{
  this.aviData = aviInfoframe;
}

AviInfoframe.prototype.parse = function()
{
  // Get Type
  this.headerType = this.getType();
  // Get Version
  this.headerVersion = this.getVersion();
  // Get Length
  this.headerLength = this.getLength();
  // Get Checksum
  this.checksum = this.getChecksum();
  // Get Scan Information
  this.scanInformation = this.getScanInformation();
  // Get Bar Data
  this.barData = this.getBarData();
  // Get Active Format Information Present
  this.activeFormatPresent = this.getActiveFormatPresent();
  // Get ColorSpace
  this.colorSpace = this.getColorSpace();
  // Get Active Portion Aspect Ratio
  this.activePortionAspectRatio = this.getActivePortionAspectRatio();
  // Get Coded Frame Aspect Ratio
  this.codedFrameAspectRatio = this.getCodedFrameAspectRatio();
  // Get Colorimetry
  this.colorimetry = this.getColorimetry();
  // Get Non-Uniform Scaling Picture
  this.nonUniformPictureScaling = this.getNonUniformPictureScaling();
  // Get RGB Quantization
  this.rgbQuantizationRange = this.getRgbQuantizationRange();
  // Get Extended Colorimetry
  this.extendedColorimetry = this.getExtendedColorimetry();
  // Get IT Content
  this.itContent = this.getITContent();
  // Get VIC
  this.vic = this.getVIC();
  // Get Pixel Repetition
  this.pixelRepetition = this.getPixelRepetition();
  // Get IT Content Type
  this.itContentType = this.getITContentType();
  // Get YCC Quantization Range
  this.yccQuantizationRange = this.getYCCQuantizationRange();
  // Get Line Number of End of Top Bar (ETB)
  this.etb = this.getETB();
  // Get Line Number of Start of Bottom Bar (SBB)
  this.sbb = this.getSBB();
  // Get Pixel Number of End of Left Bar (ELB)
  this.elb = this.getELB();
  // Get Pixel Number of Start of Right Bar (SRB)
  this.srb = this.getSRB();
}

AviInfoframe.prototype.getType = function()
{
  var TYPE_INDEX = 0;
  return this.aviData[TYPE_INDEX];
}

AviInfoframe.prototype.getVersion = function()
{
  var VERSION_INDEX = 1;
  return this.aviData[VERSION_INDEX];
}

AviInfoframe.prototype.getLength = function()
{
  var LENGTH_INDEX = 2;
  return this.aviData[LENGTH_INDEX];
}

AviInfoframe.prototype.getChecksum = function()
{
  var CHECKSUM_INDEX = 3;
  return this.aviData[CHECKSUM_INDEX];
}

AviInfoframe.prototype.getScanInformation = function()
{
  var SCAN_INFORMATION_INDEX = 4;
  var SCAN_INFORMATION_MASK = 0x03;
  return (this.aviData[SCAN_INFORMATION_INDEX] & SCAN_INFORMATION_MASK);
}

AviInfoframe.prototype.getScanInformationString = function()
{
  return this.scanInformationStrings[this.scanInformation];
}

AviInfoframe.prototype.getBarData = function()
{
  var BAR_DATA_INDEX = 4;
  var BAR_DATA_MASK = 0x0C;
  var BAR_DATA_OFFSET = 2;
  return (this.aviData[BAR_DATA_INDEX] & BAR_DATA_MASK) >> BAR_DATA_OFFSET;
}

AviInfoframe.prototype.getBarDataString = function()
{
  return this.barDataStrings[this.barData];
}

AviInfoframe.prototype.getActiveFormatPresent = function()
{
  var AF_PRESENT_INDEX = 4;
  var AF_PRESENT_MASK = 0x10;
  var AF_PRESENT_OFFSET = 4;
  return (((this.aviData[AF_PRESENT_INDEX] & AF_PRESENT_MASK) >> AF_PRESENT_OFFSET)?true:false);
}

AviInfoframe.prototype.getColorSpace = function()
{
  var COLORSPACE_INDEX = 4;
  var COLORSPACE_MASK = 0x60;
  var COLORSPACE_OFFSET = 5;
  return ((this.aviData[COLORSPACE_INDEX] & COLORSPACE_MASK) >> COLORSPACE_OFFSET);
}

AviInfoframe.prototype.getColorSpaceString = function()
{
  return this.colorSpaceStrings[this.colorSpace];
}

AviInfoframe.prototype.getActivePortionAspectRatio = function()
{
  var AP_ASPECT_RATIO_INDEX = 5;
  var AP_ASPECT_RATIO_MASK = 0x0F;
  return (this.aviData[AP_ASPECT_RATIO_INDEX] & AP_ASPECT_RATIO_MASK);
}

AviInfoframe.prototype.getActivePortionAspectRatioString = function()
{
  return this.apAspectRatioStrings[this.activePortionAspectRatio];
}

AviInfoframe.prototype.getCodedFrameAspectRatio = function()
{
  var CF_ASPECT_RATIO_INDEX = 5;
  var CF_ASPECT_RATIO_MASK = 0x30;
  var CF_ASPECT_RATIO_OFFSET = 4;
  return ((this.aviData[CF_ASPECT_RATIO_INDEX] & CF_ASPECT_RATIO_MASK) >> CF_ASPECT_RATIO_OFFSET);
}

AviInfoframe.prototype.getCodedFrameAspectRatioString = function()
{
  return this.cfAspectRatioStrings[this.codedFrameAspectRatio];
}

AviInfoframe.prototype.getColorimetry = function()
{
  var COLORIMETRY_INDEX = 5;
  var COLORIMETRY_MASK = 0xC0;
  var COLORIMETRY_OFFSET = 6;
  return ((this.aviData[COLORIMETRY_INDEX] & COLORIMETRY_MASK) >> COLORIMETRY_OFFSET);
}

AviInfoframe.prototype.getColorimetryString = function()
{
  return this.colorimetryStrings[this.colorimetry];
}

AviInfoframe.prototype.getNonUniformPictureScaling = function()
{
  var NON_UNIFORM_PICTURE_SCALING_INDEX = 6;
  var NON_UNIFORM_PICTURE_SCALING_MASK = 0x03;
  return (this.aviData[NON_UNIFORM_PICTURE_SCALING_INDEX] & NON_UNIFORM_PICTURE_SCALING_MASK);
}

AviInfoframe.prototype.getNonUniformPictureScalingString = function()
{
  return this.nonUniformPictureScalingStrings[this.nonUniformPictureScaling];
}

AviInfoframe.prototype.getRgbQuantizationRange = function()
{
  var RGB_QUANT_RANGE_INDEX = 6;
  var RGB_QUANT_RANGE_MASK = 0x0C;
  var RGB_QUANT_RANGE_OFFSET = 2;
  return ((this.aviData[RGB_QUANT_RANGE_INDEX] & RGB_QUANT_RANGE_MASK) >> RGB_QUANT_RANGE_OFFSET);
}

AviInfoframe.prototype.getRgbQuantizationRangeString = function()
{
  return this.rgbQuantizationRangeStrings[this.rgbQuantizationRange];
}

AviInfoframe.prototype.getExtendedColorimetry = function()
{
  var EXTENDED_COLORIMETRY_INDEX = 6;
  var EXTENDED_COLORIMETRY_MASK = 0x70;
  var EXTENDED_COLORIMETRY_OFFSET = 4;
  return ((this.aviData[EXTENDED_COLORIMETRY_INDEX] & EXTENDED_COLORIMETRY_MASK) >> EXTENDED_COLORIMETRY_OFFSET);
}

AviInfoframe.prototype.getExtendedColorimetryString = function()
{
  return this.extendedColorimetryStrings[this.extendedColorimetry];
}

AviInfoframe.prototype.getITContent = function()
{
  var IT_CONTENT_INDEX = 6;
  var IT_CONTENT_MASK = 0x80;
  var IT_CONTENT_OFFSET = 7;
  return (((this.aviData[IT_CONTENT_INDEX] & IT_CONTENT_MASK) >> IT_CONTENT_OFFSET)?true:false);
}

AviInfoframe.prototype.getVIC = function()
{
  var VIC_INDEX = 7;
  var VIC_MASK = 0x7F;
  return  (this.aviData[VIC_INDEX] & VIC_MASK);
}

AviInfoframe.prototype.getPixelRepetition = function()
{
  var PIXEL_REPETITION_INDEX = 8;
  var PIXEL_REPETITION_MASK = 0x0F;
  return (this.aviData[PIXEL_REPETITION_INDEX] & PIXEL_REPETITION_MASK);
}

AviInfoframe.prototype.getITContentType = function()
{
  var IT_CONTENT_TYPE_INDEX = 8;
  var IT_CONTENT_TYPE_MASK = 0x30;
  var IT_CONTENT_TYPE_OFFSET = 4;
  return ((this.aviData[IT_CONTENT_TYPE_INDEX] & IT_CONTENT_TYPE_MASK) >> IT_CONTENT_TYPE_OFFSET);
}

AviInfoframe.prototype.getITContentTypeString = function()
{
  return this.itContentTypeStrings[this.itContentType];
}

AviInfoframe.prototype.getYCCQuantizationRange = function()
{
  var YCC_QUANTIZATION_RANGE_INDEX = 8;
  var YCC_QUANTIZATION_RANGE_MASK = 0xC0;
  var YCC_QUANTIZATION_RANGE_OFFSET = 6;
  return ((this.aviData[YCC_QUANTIZATION_RANGE_INDEX] & YCC_QUANTIZATION_RANGE_MASK)
                                                          >> YCC_QUANTIZATION_RANGE_OFFSET);
}

AviInfoframe.prototype.getYCCQuantizationRangeString = function()
{
  return this.yccQuantizationRangeStrings[this.yccQuantizationRange];
}

AviInfoframe.prototype.getETB = function()
{
  var ETB_LOWER_INDEX = 9;
  var ETB_UPPER_INDEX = 10;
  return ((this.aviData[ETB_UPPER_INDEX] << 8) | this.aviData[ETB_LOWER_INDEX]);
}

AviInfoframe.prototype.getSBB = function()
{
  var SBB_LOWER_INDEX = 11;
  var SBB_UPPER_INDEX = 12;
  return ((this.aviData[SBB_UPPER_INDEX] << 8) | this.aviData[SBB_LOWER_INDEX]);
}

AviInfoframe.prototype.getELB = function()
{
  var ELB_LOWER_INDEX = 13;
  var ELB_UPPER_INDEX = 14;
  return ((this.aviData[ELB_UPPER_INDEX] << 8) | this.aviData[ELB_LOWER_INDEX]);
}

AviInfoframe.prototype.getSRB = function()
{
  var SRB_LOWER_INDEX = 15;
  var SRB_UPPER_INDEX = 16;
  return ((this.aviData[SRB_LOWER_INDEX] << 8) | this.aviData[SRB_UPPER_INDEX]);
}
