'use strict';

/* Controllers */


function MyCtrl1() {}
MyCtrl1.$inject = [];


function MyCtrl2() {
}
MyCtrl2.$inject = [];

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
$scope.originalEdid =  "00,FF,FF,FF,FF,FF,FF,00,4C,2D,9B,06,01,00,00,00, \n" +
                       "33,13,01,03,80,59,32,78,0A,EE,91,A3,54,4C,99,26, \n" +
                       "0F,50,54,BD,EF,80,71,4F,81,00,81,40,81,80,95,00, \n" +
                       "95,0F,B3,00,A9,40,02,3A,80,18,71,38,2D,40,58,2C, \n" +
                       "45,00,A0,5A,00,00,00,1E,66,21,50,B0,51,00,1B,30, \n" +
                       "40,70,36,00,A0,5A,00,00,00,1E,00,00,00,FD,00,18, \n" +
                       "4B,1A,51,17,00,0A,20,20,20,20,20,20,00,00,00,FC, \n" +
                       "00,53,41,4D,53,55,4E,47,0A,20,20,20,20,20,01,7F, \n" +
                       "02,03,2E,F1,4B,90,1F,04,13,05,14,03,12,20,21,22, \n" +
                       "23,09,07,07,83,01,00,00,E2,00,0F,E3,05,03,01,6E, \n" +
                       "03,0C,00,20,00,B8,2D,20,D0,04,01,40,07,3F,02,3A, \n" +
                       "80,D0,72,38,2D,40,10,2C,45,80,A0,5A,00,00,00,1E, \n" +
                       "01,1D,00,BC,52,D0,1E,20,B8,28,55,40,A0,5A,00,00, \n" +
                       "00,1E,01,1D,80,D0,72,1C,16,20,10,2C,25,80,A0,5A, \n" +
                       "00,00,00,9E,00,00,00,00,00,00,00,00,00,00,00,00, \n" +
                       "00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,74";
    */
// QuantumData Default Edid
$scope.originalEdid =  "00 FF FF FF FF FF FF 00 44 89 B2 00 05 00 00 00 \n" +
                       "20 13 01 03 80 50 2D 78 0A 0D C9 A0 57 47 98 27 \n" +
                       "12 48 4C 20 00 00 01 01 01 01 01 01 01 01 01 01 \n" +
                       "01 01 01 01 01 01 01 1D 80 18 71 1C 16 20 58 2C \n" +
                       "25 00 C4 8E 21 00 00 9E 8C 0A D0 8A 20 E0 2D 10 \n" +
                       "10 3E 96 00 13 8E 21 00 00 18 00 00 00 FC 00 48 \n" +
                       "44 4D 49 20 41 6E 61 6C 79 7A 65 72 00 00 00 FD \n" +
                       "00 17 F1 08 8C 11 00 0A 20 20 20 20 20 20 01 0C \n" +
                       "02 03 63 71 83 4F 00 00 67 03 0C 00 10 00 38 21 \n" +
                       "32 0F 7F 07 17 7F FF 3F 7F FF 57 7F 00 5F 7F 01 \n" +
                       "67 7F 00 5F 85 02 03 04 01 06 07 08 09 0A 0B 0C \n" +
                       "0D 0E 0F 10 11 12 13 14 15 16 17 18 19 1A 1B 1C \n" +
                       "1D 1E 1F 5F 20 21 22 23 24 25 26 27 28 29 2A 2B \n" +
                       "2C 2D 2E 2F 30 31 32 33 34 35 36 37 38 39 3A 3B \n" +
                       "3C 3D 3E 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
                       "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 E3";



    $scope.edid = new Edid();

    $scope.validChecksums = new Array();
    $scope.dtdBit2Text = new Array();
    $scope.dtdBit1Text = new Array();

    //*********************************
    // Start Actually Parsing
    $scope.parseEdid = function() {
    // Scrub the EDID of all the ugly stuff
    $scope.scrubbedEdid = scrubEdid($scope.originalEdid);
    // Convert the EDID into an integer array
    var edidArray = convertToIntArray($scope.scrubbedEdid);
    // Set EDID data
    $scope.edid.setEdidData(edidArray);

    // Parse the EDID
    $scope.edid.parse();

    // Setup the View
    $scope.updateOutputEdid();
    $scope.updateChecksums();
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
    $scope.block0 = 'partials/block0/block0.html';
    $scope.edidHeaderInfo = 'partials/block0/edidHeaderInfo.html';
    if($scope.edid.bdp.digitalInput == true)
    {
      $scope.bdpPage = 'partials/block0/bdp/digital.html';
    }
    else
    {
      $scope.bdpPage = 'partials/block0/bdp/analog.html';
    }
    $scope.chromacityCoords = 'partials/block0/chromacityCoords.html';
    $scope.timingBitmap = 'partials/block0/timingBitmap.html';
    $scope.standardTimingInfo = 'partials/block0/standardTimingInformation.html';
    $scope.stdDisplayModes = 'partials/block0/stdDisplayModes.html'
    $scope.updateDtdBit2Text();
    $scope.updateDtdBit1Text();
    $scope.detailedTimingDescriptors = 'partials/block0/detailedTimingDescriptors.html'
  }
  $scope.updateBlockX = function()
  {
    $scope.blockX = 'partials/blockX/blockX.html';
    $scope.extHeader = 'partials/blockX/extHeader.html';
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
      if($scope.addCommas && (index != lastByte))
      {
        comma = ",";
      }
      else
      {
        comma = ""
      }

      if($scope.addHex)
      {
        hexPrefix = "0x";
      }
      else
      {
        hexPrefix = "";
      }
      if($scope.addLineBreaks && ((index % 16) == 15) && (index != lastByte))
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
  $scope.updateDtdBit2Text = function()
  {
    for(var index = 0; index < $scope.edid.dtds.length; index++)
    {
      var bit2Text = new String();
      if($scope.edid.dtds[index].syncType ==
                $scope.edid.syncTypeEnum.DIGITAL_SEPARATE)
      {
        bit2Text = "Vertical Sync Polarity: ";
        bit2Text += $scope.edid.dtds[index].vSyncPolarity;
      }
      else
      {
        bit2Text = "Vertical Sync Serrated: ";
        bit2Text += $scope.edid.dtds[index].vSyncSerrated;
      }
      $scope.dtdBit2Text[index] = bit2Text;
    }
  }
  $scope.updateDtdBit1Text = function()
  {
    for(var index = 0; index < $scope.edid.dtds.length; index++)
    {
      var bit1Text = new String();
      if(($scope.edid.dtds[index].syncType ==
                $scope.edid.syncTypeEnum.ANALOG_COMPOSITE) ||
                ($scope.edid.dtds[index].syncType ==
                $scope.edid.syncTypeEnum.BIPOLAR_ANALOG_COMPOSITE))
      {
        bit1Text = "Sync on all 3 RGB lines: ";
        bit1Text += $scope.edid.dtds[index].syncAllRGBLines;
      }
      else
      {
        bit1Text = "HSync polarity: ";
        bit1Text += $scope.edid.dtds[index].hSyncPolarity;
      }
      $scope.dtdBit1Text[index] = bit1Text;
    }
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
    return isSet.toString().toUpperCase();
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