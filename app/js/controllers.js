'use strict';

/* Controllers */
function EdidCtrl($scope) {

  // Populated test EDID
  /*
  $scope.originalEdid =
"00 FF FF FF FF FF FF 00 4D D9 FA 06 00 00 00 00 \n" +
"2D 0C 01 03 90 1F 11 00 EA A8 E0 99 57 4B 92 25 \n" +
"1C 50 54 00 00 00 01 01 01 01 01 01 01 01 01 01 \n" +
"01 01 01 01 01 01 40 38 40 F6 63 84 13 30 52 52 \n" +
"66 50 36 AE 10 00 00 18 00 00 00 FC 00 4E 76 69 \n" +
"64 69 61 20 44 65 66 61 75 6C 00 00 00 FC 00 74 \n" +
"20 46 6C 61 74 20 50 61 6E 65 6C 00 00 00 00 FD \n" +
"00 00 3D 1D 38 0B 00 00 20 20 20 20 20 00 00 48";
*/

/* New Test Edid
 * http://www.avsforum.com/t/1253912/first-hdmi-1-4-edid-report
 */
  // $scope.originalEdid =  "00,FF,FF,FF,FF,FF,FF,00,4C,2D,9B,06,01,00,00,00, \n" +
  //                        "33,13,01,03,80,59,32,78,0A,EE,91,A3,54,4C,99,26, \n" +
  //                        "0F,50,54,BD,EF,80,71,4F,81,00,81,40,81,80,95,00, \n" +
  //                        "95,0F,B3,00,A9,40,02,3A,80,18,71,38,2D,40,58,2C, \n" +
  //                        "45,00,A0,5A,00,00,00,1E,66,21,50,B0,51,00,1B,30, \n" +
  //                        "40,70,36,00,A0,5A,00,00,00,1E,00,00,00,FD,00,18, \n" +
  //                        "4B,1A,51,17,00,0A,20,20,20,20,20,20,00,00,00,FC, \n" +
  //                        "00,53,41,4D,53,55,4E,47,0A,20,20,20,20,20,01,7F, \n" +
  //                        "02,03,2E,F1,4B,90,1F,04,13,05,14,03,12,20,21,22, \n" +
  //                        "23,09,07,07,83,01,00,00,E2,00,0F,E3,05,03,01,6E, \n" +
  //                        "03,0C,00,20,00,B8,2D,20,D0,04,01,40,07,3F,02,3A, \n" +
  //                        "80,D0,72,38,2D,40,10,2C,45,80,A0,5A,00,00,00,1E, \n" +
  //                        "01,1D,00,BC,52,D0,1E,20,B8,28,55,40,A0,5A,00,00, \n" +
  //                        "00,1E,01,1D,80,D0,72,1C,16,20,10,2C,25,80,A0,5A, \n" +
  //                        "00,00,00,9E,00,00,00,00,00,00,00,00,00,00,00,00, \n" +
  //                        "00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,74";

  $scope.getRevision = function(){
    return 1.1;
  };
  $scope.treeCallback = function(node){
    $scope.edidData = node.url+"?"+$scope.getRevision();
  };
  $scope.bdpHandler = function(node){
    if($scope.edid.bdp.digitalInput == true)
    {
      $scope.edidData = 'partials/block0/bdp/digital.html'+"?"+$scope.getRevision();
    }
    else
    {
      $scope.edidData = 'partials/block0/bdp/analog.html'+"?"+$scope.getRevision();
    }
  }
  $scope.dtdHandler = function(node){
    // Parse Block and dtd number
    var blockDescriptor  = node.id.replace("block","").split("Descriptor")
    var index = blockDescriptor[1]-1;
    $scope.dtd = $scope.edid.dtds[index];
    var block = 0;
    $scope.updateDtdBit2Text(block,index);
    $scope.updateDtdBit1Text(block,index);
    $scope.edidData = node.url+"?"+$scope.getRevision();
  }
  $scope.blockXHandler = function(node){
    // Parse Block Extension Number
    var blockNumber = node.id.replace("tBlock","").charAt(0);
    var index = blockNumber - 1;
    $scope.ext = $scope.edid.exts[index];

    // Set the EDID Data View to load the node's URL
    $scope.edidData = node.url+"?"+$scope.getRevision(); 
  }
  $scope.ceaHandler = function(node){
    // Parse Block and CEA number
    var blockNumber = node.id.replace("tBlock","").charAt(0);
    var index = blockNumber - 1;
    $scope.ext = $scope.edid.exts[index];
    
    var dataBlock = node.id.replace("tBlock","").substring(1);
    var ceaBlockNumber;
    if(dataBlock.substring(0,5) == 
      $scope.edid.dataBlockType.RESERVED.string.substring(0,5))
    {
      // Should be able to get away with doing nothing!
    }
    else if(dataBlock.substring(0,5) == 
      $scope.edid.dataBlockType.AUDIO.string.substring(0,5))
    {
      // Parse CEA Data Block Number
      ceaBlockNumber = dataBlock.substring($scope.edid.dataBlockType.AUDIO.string.length);
      $scope.ceaDataBlock = $scope.ext.dataBlockCollection[ceaBlockNumber];
    }
    else if(dataBlock.substring(0,5) == 
      $scope.edid.dataBlockType.VIDEO.string.substring(0,5))
    {
      ceaBlockNumber = dataBlock.substring($scope.edid.dataBlockType.VIDEO.string.length);
      $scope.ceaDataBlock = $scope.ext.dataBlockCollection[ceaBlockNumber];
    }
    else if(dataBlock.substring(0,5) == 
      $scope.edid.dataBlockType.VENDOR_SPECIFIC.string.substring(0,5))
    {
      ceaBlockNumber = dataBlock.substring(
                $scope.edid.dataBlockType.VENDOR_SPECIFIC.string.length);
      $scope.ceaDataBlock = $scope.ext.dataBlockCollection[ceaBlockNumber];
    }
    else if(dataBlock.substring(0,5) == 
      $scope.edid.dataBlockType.SPEAKER_ALLOCATION.string.substring(0,5))
    {
      ceaBlockNumber = dataBlock.substring(
                $scope.edid.dataBlockType.SPEAKER_ALLOCATION.string.length);
      $scope.ceaDataBlock = $scope.ext.dataBlockCollection[ceaBlockNumber];
    }
    // Set the EDID Data View to load the node's URL
    $scope.edidData = node.url+"?"+$scope.getRevision(); 
  }
  $scope.extDtdHandler = function(node){
    var blockNumber = node.id.replace("tBlock","").charAt(0);
    var index = blockNumber - 1;
    $scope.ext = $scope.edid.exts[index];
    var dtdNumber = node.id.replace("tBlock","").substring(1).replace("Dtd","");
    var dtdIndex = dtdNumber -1;
    $scope.dtd = $scope.ext.dtds[dtdIndex];
    $scope.updateDtdBit2Text(blockNumber,dtdIndex);
    $scope.updateDtdBit1Text(blockNumber,dtdIndex);
    $scope.edidData = node.url+"?"+$scope.getRevision(); 
  }
    // QuantumData Default Edid
    $scope.inputTextbox =  {originalEdid:$scope.originalEdid};

    $scope.edid = new Edid();
    $scope.checkbox = {addLine:false,addCommas:false,addHex:true};

    $scope.validChecksums = new Array();
    $scope.dtdBit2Text = new Array();
    $scope.dtdBit1Text = new Array();

    //*********************************
    // Start Actually Parsing
    $scope.parseEdid = function() {
    // Scrub the EDID of all the ugly stuff
    $scope.scrubbedEdid = scrubEdid($scope.inputTextbox.originalEdid);
    // Convert the EDID into an integer array
    var edidArray = convertToIntArray($scope.scrubbedEdid);
    // Set EDID data
    $scope.edid.setEdidData(edidArray);

    // Parse the EDID
    $scope.edid.parse();

    // Setup the View
    $scope.updateOutputEdid();
    $scope.updateChecksums();
    
    // Clear out Our tree
    $scope.treedata = [];
    $scope.updateBlock0();
    $scope.dataBlockView = ['partials/blockX/dataBlocks/reserved.html',
                              'partials/blockX/dataBlocks/audio.html',
                              'partials/blockX/dataBlocks/video.html',
                              'partials/blockX/dataBlocks/vendorSpecific.html',
                              'partials/blockX/dataBlocks/speakerAllocation.html'];
    $scope.updateBlockX();

  };
  $scope.updateBlock0 = function()
  {
    var block0 = {label:"Block 0", 
      id:"tBlock0",
      children: []};
    
    var headerInfo = {label:"Header Information",
          id: "tHeaderInfo",
          callback:$scope.treeCallback,
          url:'partials/block0/edidHeaderInfo.html',
          "children" : []};
    block0.children.push(headerInfo);

    var bdp = {label:"Basic Display Parameters",
          id:"tBDP",
          callback:$scope.bdpHandler,
          "children":[]};
    block0.children.push(bdp);

    var chromaticityCoords = {label:"Chromaticity Coordinates",
          id:"tchromaticityCoords",
          callback:$scope.treeCallback,
          url:'partials/block0/chromacityCoords.html',
          "children" : [] };
    block0.children.push(chromaticityCoords);

    var timingBitmap = {label:"Timing Bitmap",
          id:"tTimingBitmap",
          callback:$scope.treeCallback,
          url:'partials/block0/timingBitmap.html',
          "children" : [] }
    block0.children.push(timingBitmap);

    var standardTimingInfo = {label:"Standard Timing Information", 
          id: "tStandardTimingInfo",
          "children" : []};
    var standardDisplayModes = {label:"Standard Display Modes",
             id: "role151",
             callback:$scope.treeCallback,
             url:'partials/block0/stdDisplayModes.html',
              "children" : [] };
    standardTimingInfo.children.push(standardDisplayModes);
    
    // For Each Block 0 Descriptor
    for(var index = 0; index < $scope.edid.dtds.length; index++)
    {
      // We should have a url variable, determine what type of descriptor it
      // is, then change the URL, base on the type of descriptor
      // Also, this needs it's own call back, so if it gets DTD callback,
      // we can properly identify and update
      // Create an Object
      var descriptorNumber = index+1;
      var descriptor = {label:"Descriptor " + descriptorNumber,
             id: "block0Descriptor"+descriptorNumber,
             callback:$scope.dtdHandler,
             url:'partials/block0/detailedTimingDescriptors.html',
              "children" : []};
      // Add the object to the Standard Timing Info Children
      standardTimingInfo.children.push(descriptor);
    }

    
    // Add Standard Timing Info to Block 0
    block0.children.push(standardTimingInfo);

    $scope.treedata.push(block0);
   
    // Default Data showing is EDID Header Info
    $scope.edidData = 'partials/block0/edidHeaderInfo.html'+"?"+$scope.getRevision();

    $scope.detailedTimingDescriptors = 'partials/block0/detailedTimingDescriptors.html'
  }
  $scope.updateBlockX = function()
  {
    for(var index = 0; index < $scope.edid.exts.length; index++)
    {
      var blockNumber = index+1;
      var blockLabel = "Block "+blockNumber;
      var id = "tBlock"+blockNumber;

      // Add Block 
      var blockX = {label:blockLabel, 
                    id:id,
                    children: []};
      
      var extHeader = {label:"Extenstion Header Information",
                      id: id+"ExtensionHeaderInfo",
                      callback:$scope.blockXHandler,
                      url:'partials/blockX/extHeader.html',
                      "children" : []};
      blockX.children.push(extHeader);
      
      var ceaDataBlock = {label:"CEA Data Block",
                      id: id+"CeaDataBlock",
                      "children" : []};
      // For Each CEA Data Block
      for(var ceaIndex = 0; 
            ceaIndex < $scope.edid.exts[index].dataBlockCollection.length; 
            ceaIndex++)
      {
        var dataBlock = $scope.edid.exts[index].dataBlockCollection[ceaIndex];
        var treeDataBlock = {};
                              
        if(dataBlock.tag == $scope.edid.dataBlockType.RESERVED)
        {
          treeDataBlock = {label:"Reserved Data Block",
                            id: id+$scope.edid.dataBlockType.RESERVED.string+ceaIndex,
                            callback:$scope.ceaHandler,
                            url:'partials/blockX/dataBlocks/reserved.html',
                            "children" : []};
        }
        else if(dataBlock.tag == $scope.edid.dataBlockType.AUDIO)
        {
          treeDataBlock = {label:"Audio Data Block",
                            id: id+$scope.edid.dataBlockType.AUDIO.string+ceaIndex,
                            callback:$scope.ceaHandler,
                            url:'partials/blockX/dataBlocks/audio.html',
                            "children" : []};
        }
        else if(dataBlock.tag == $scope.edid.dataBlockType.VIDEO)
        {
          treeDataBlock = {label:"Video Data Block",
                            id: id+$scope.edid.dataBlockType.VIDEO.string+ceaIndex,
                            callback:$scope.ceaHandler,
                            url:'partials/blockX/dataBlocks/video.html',
                            "children" : []};
        }        
        else if(dataBlock.tag == $scope.edid.dataBlockType.VENDOR_SPECIFIC)
        {
          treeDataBlock = {label:"Vendor Specific Data Block",
                            id: id+$scope.edid.dataBlockType.VENDOR_SPECIFIC.string+ceaIndex,
                            callback:$scope.ceaHandler,
                            url:'partials/blockX/dataBlocks/vendorSpecific.html',
                            "children" : []};
        }        
        else if(dataBlock.tag == $scope.edid.dataBlockType.SPEAKER_ALLOCATION)
        {
          treeDataBlock = {label:"Speaker Allocation Data Block",
                            id: id+$scope.edid.dataBlockType.SPEAKER_ALLOCATION.string+ceaIndex,
                            callback:$scope.ceaHandler,
                            url:'partials/blockX/dataBlocks/speakerAllocation.html',
                            "children" : []};
        }
        ceaDataBlock.children.push(treeDataBlock);
      }

      blockX.children.push(ceaDataBlock);

      // For each extension DTD, build the tree object then add it to blockX
      for(var extDtdIndex = 0; 
      extDtdIndex < $scope.edid.exts[index].dtds.length; 
      extDtdIndex++)
      {
        var dtd = $scope.edid.exts[index].dtds[extDtdIndex];
        var dtdNumber = extDtdIndex+1;
        var dtdTree = {label:"Detailed Timing Descriptor "+dtdNumber,
                            id: id+"Dtd"+dtdNumber,
                            callback:$scope.extDtdHandler,
                            url:'partials/blockX/extDtds.html',
                            "children" : []};
        blockX.children.push(dtdTree);
      }

      // Add BlockX to treeData
      $scope.treedata.push(blockX);
    }


    $scope.blockX = 'partials/blockX/blockX.html';
    $scope.extDataBlock = 'partials/blockX/extDataBlock.html';
    $scope.sadView = 'partials/blockX/dataBlocks/shortAudioDescriptors/shortAudioDescriptor.html';
    $scope.extDtds = 'partials/blockX/extDtds.html';
  }
  $scope.updateOutputEdid = function()
  {
    var comma;
    var newLine;
    var hexPrefix;
    var edidString = new Array();
    var lastByte = $scope.scrubbedEdid.length - 1;
    for(var index = 0; index < $scope.scrubbedEdid.length; index++)
    {
      if($scope.checkbox.addCommas && (index != lastByte))
      {
        comma = ",";
      }
      else
      {
        comma = ""
      }

      if($scope.checkbox.addHex)
      {
        hexPrefix = "0x";
      }
      else
      {
        hexPrefix = "";
      }
      if($scope.checkbox.addLineBreaks && ((index % 16) == 15) && (index != lastByte))
      {
        newLine = "\n";
        if((index % 128) == 127)
        {
          newLine += "\n";
        }
      }
      else
      {
        newLine = "";
      }
      edidString[index] = hexPrefix+$scope.scrubbedEdid[index]+comma+newLine;
    }

    $scope.outputEdid = edidString.join(" ");
    // Straight up HACK, and just set output edid to original EDID.
    $scope.inputTextbox.originalEdid = $scope.outputEdid;
  }
  $scope.updateChecksums = function()
  {
    var numberBlocks = $scope.edid.edidData.length / $scope.edid.EDID_BLOCK_LENGTH;
    for(var index = 0; index < numberBlocks; index++)
    {
      $scope.validChecksums[index] = $scope.edid.validChecksum(index).toString().toUpperCase();
    }
  }
  $scope.isTimingBitmapSet = function(index)
  {
    var tbLength = $scope.edid.establishedTimingBitmaps.length;
    var msb = 0x800000;
    var isSet = ($scope.edid.timingBitmap & (msb >> index))?true:false;
    return isSet;
  }
  $scope.updateDtdBit2Text = function(block,index)
  {
      var bit2Text = new String();
      var dtd = {};
      if(block == 0)
      {
        dtd = $scope.edid.dtds[index];
      }
      else
      {
        dtd = $scope.edid.exts[block-1].dtds[index];
      }

      if(dtd.syncType ==
                $scope.edid.syncTypeEnum.DIGITAL_SEPARATE)
      {
        bit2Text = "Vertical Sync Polarity: ";
        bit2Text += dtd.vSyncPolarity;
      }
      else
      {
        bit2Text = "Vertical Sync Serrated: ";
        bit2Text += dtd.vSyncSerrated;
      }
      $scope.dtd.dtdBit2Text = bit2Text;
  }
  $scope.updateDtdBit1Text = function(block,index)
  {
      var bit1Text = new String();
      var dtd = {};
      
      if(block == 0)
      {
        dtd = $scope.edid.dtds[index];
      }
      else
      {
        dtd = $scope.edid.exts[block-1].dtds[index];
      }

      if((dtd.syncType ==
                $scope.edid.syncTypeEnum.ANALOG_COMPOSITE) ||
                (dtd.syncType ==
                $scope.edid.syncTypeEnum.BIPOLAR_ANALOG_COMPOSITE))
      {
        bit1Text = "Sync on all 3 RGB lines: ";
        bit1Text += dtd.syncAllRGBLines;
      }
      else
      {
        bit1Text = "HSync polarity: ";
        bit1Text += dtd.hSyncPolarity;
      }
      $scope.dtd.dtdBit1Text = bit1Text;
  }
  $scope.accordionIdText = function(blockNumber)
  {
    var accordionIdText = "block"+blockNumber+1;
    return accordionIdText;
  }
  $scope.accordionHrefText = function(blockNumber)
  {
    var accordionHrefText = "#block"+blockNumber+1;
    return accordionHrefText;
  }
  $scope.shortAudioDescView = function(format)
  {
    var view;

    if(format <= $scope.edid.audioFormatArray[0])
    {
      view = 'partials/blockX/dataBlocks/shortAudioDescriptors/lpcm.html';
    }
    else if(format <= $scope.edid.audioFormatArray[1])
    {
      view = 'partials/blockX/dataBlocks/shortAudioDescriptors/twoEight.html';
    }
    else if(format <= $scope.edid.audioFormatArray[2])
    {
      view = 'partials/blockX/dataBlocks/shortAudioDescriptors/nineThirteen.html';
    }
    else if(format <= $scope.edid.audioFormatArray[3])
    {
      view = 'partials/blockX/dataBlocks/shortAudioDescriptors/wmaPro.html';
    }
    else if(format <= $scope.edid.audioFormatArray[4])
    {
      view = 'partials/blockX/dataBlocks/shortAudioDescriptors/extension.html';
    }

    return view;
  }
  $scope.isBitSet = function(testByte,index)
  {
    var isSet = (testByte & (1 << index))?true:false;
    return isSet;
  }
  $scope.pad = function(num, size)
  {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  }
}

function scrubEdid(edid)
{
  var scrubbedEdid;

  // Remove commas, replace with spaces
  scrubbedEdid = edid.replace(/,/g,' ');
  // Remove 0x for hex
  scrubbedEdid = scrubbedEdid.replace(/0x/g,' ');
  // Replace Tabs
  scrubbedEdid = scrubbedEdid.replace('\t',' ');
  // Remove all line returns
  scrubbedEdid = scrubbedEdid.replace(/(\r\n|\n|\r)/gm,' ');
  // Remove multiple spaces
  scrubbedEdid = scrubbedEdid.replace( / +/g,' ');
  // Make hex upper case
  scrubbedEdid = scrubbedEdid.toUpperCase();
  // Trim Leading and ending white space
  scrubbedEdid = scrubbedEdid.trim();
  // Convert to string array
  scrubbedEdid = scrubbedEdid.split(" ");

  return scrubbedEdid;
}

function convertToIntArray(stringArray)
{
  var edidData = [];
  for(var i=0; i<stringArray.length; i++)
  {
    edidData[i] = parseInt(stringArray[i], 16);
  }
  return edidData;
}


/* Test Data
 * 0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0A 0x0B 0x0C 0x0D 0x0E 0x0F
 * 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F

 * Internet Edid
00 FF FF FF FF FF FF 00 3A C4 00 04 00 00 00 00
2D 0C 01 03 80 20 18 00 EA A8 E0 99 57 4B 92 25
1C 50 54 00 00 00 01 01 01 01 01 01 01 01 01 01
01 01 01 01 01 01 48 3F 40 30 62 B0 32 40 4C C0
13 00 42 F3 10 00 00 1E 00 00 00 FC 00 4E 76 69
64 69 61 20 44 65 66 61 75 6C 00 00 00 FC 00 74
20 46 6C 61 74 20 50 61 6E 65 6C 00 00 00 00 FD
00 00 3C 1D 4C 11 00 00 20 20 20 20 20 00 00 9C

 * Sony Edid
00 FF FF FF FF FF FF 00 4D D9 FA 06 00 00 00 00
2D 0C 01 03 90 1F 11 00 EA A8 E0 99 57 4B 92 25
1C 50 54 00 00 00 01 01 01 01 01 01 01 01 01 01
01 01 01 01 01 01 40 38 40 F6 63 84 13 30 52 52
66 50 36 AE 10 00 00 18 00 00 00 FC 00 4E 76 69
64 69 61 20 44 65 66 61 75 6C 00 00 00 FC 00 74
20 46 6C 61 74 20 50 61 6E 65 6C 00 00 00 00 FD
00 00 3D 1D 38 0B 00 00 20 20 20 20 20 00 00 48
 *
 */
 
 /* Samsung LE40C750R2W
 http://www.avsforum.com/t/1253912/first-hdmi-1-4-edid-report
 
0x00 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0x00 0x4C 0x2D 0x9B 0x06 0x01 0x00 0x00 0x00
 0x33 0x13 0x01 0x03 0x80 0x59 0x32 0x78 0x0A 0xEE 0x91 0xA3 0x54 0x4C 0x99 0x26
 0x0F 0x50 0x54 0xBD 0xEF 0x80 0x71 0x4F 0x81 0x00 0x81 0x40 0x81 0x80 0x95 0x00
 0x95 0x0F 0xB3 0x00 0xA9 0x40 0x02 0x3A 0x80 0x18 0x71 0x38 0x2D 0x40 0x58 0x2C
 0x45 0x00 0xA0 0x5A 0x00 0x00 0x00 0x1E 0x66 0x21 0x50 0xB0 0x51 0x00 0x1B 0x30
 0x40 0x70 0x36 0x00 0xA0 0x5A 0x00 0x00 0x00 0x1E 0x00 0x00 0x00 0xFD 0x00 0x18
 0x4B 0x1A 0x51 0x17 0x00 0x0A 0x20 0x20 0x20 0x20 0x20 0x20 0x00 0x00 0x00 0xFC
 0x00 0x53 0x41 0x4D 0x53 0x55 0x4E 0x47 0x0A 0x20 0x20 0x20 0x20 0x20 0x01 0x7F

 0x02 0x03 0x2E 0xF1 0x4B 0x90 0x1F 0x04 0x13 0x05 0x14 0x03 0x12 0x20 0x21 0x22
 0x23 0x09 0x07 0x07 0x83 0x01 0x00 0x00 0xE2 0x00 0x0F 0xE3 0x05 0x03 0x01 0x6E
 0x03 0x0C 0x00 0x20 0x00 0xB8 0x2D 0x20 0xD0 0x04 0x01 0x40 0x07 0x3F 0x02 0x3A
 0x80 0xD0 0x72 0x38 0x2D 0x40 0x10 0x2C 0x45 0x80 0xA0 0x5A 0x00 0x00 0x00 0x1E
 0x01 0x1D 0x00 0xBC 0x52 0xD0 0x1E 0x20 0xB8 0x28 0x55 0x40 0xA0 0x5A 0x00 0x00
 0x00 0x1E 0x01 0x1D 0x80 0xD0 0x72 0x1C 0x16 0x20 0x10 0x2C 0x25 0x80 0xA0 0x5A
 0x00 0x00 0x00 0x9E 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00
 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x74

 */

function aviCtrl($scope) {

  $scope.inputText = {data:""};
  $scope.avi = new AviInfoframe();
  $scope.checkbox = {addLine:false,addCommas:false,addHex:true};

  $scope.parse = function()
  {
    // Scrub the EDID of all the ugly stuff
    $scope.inputText.data = scrubHexData($scope.inputText.data);
    // Convert the EDID into an integer array
    $scope.aviArray = convertToIntArray($scope.inputText.data);

    // Set AVI Infoframe Data
    $scope.avi.setAviData($scope.aviArray);
    // Parse AVI data
    $scope.avi.parse();

    $scope.updateTextBox();
    $scope.aviParsedPartial = 'partials/aviInfoframe/_parsedData.html'
  }

  $scope.updateTextBox = function()
  {
    $scope.inputText.data = convertToHexString($scope.aviArray, $scope.checkbox.addCommas,
                                 $scope.checkbox.addHex, $scope.checkbox.addLineBreaks)
  }
}