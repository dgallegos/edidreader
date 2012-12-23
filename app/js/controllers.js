'use strict';

/* Controllers */


function MyCtrl1() {}
MyCtrl1.$inject = [];


function MyCtrl2() {
}
MyCtrl2.$inject = [];

function EdidCtrl($scope) {
  // Populated test EDID
  $scope.originalEdid = 
"00 FF FF FF FF FF FF 00 4D D9 FA 06 00 00 00 00 \n" +
"2D 0C 01 03 90 1F 11 00 EA A8 E0 99 57 4B 92 25 \n" +
"1C 50 54 00 00 00 01 01 01 01 01 01 01 01 01 01 \n" +
"01 01 01 01 01 01 40 38 40 F6 63 84 13 30 52 52 \n" +
"66 50 36 AE 10 00 00 18 00 00 00 FC 00 4E 76 69 \n" +
"64 69 61 20 44 65 66 61 75 6C 00 00 00 FC 00 74 \n" +
"20 46 6C 61 74 20 50 61 6E 65 6C 00 00 00 00 FD \n" +
"00 00 3D 1D 38 0B 00 00 20 20 20 20 20 00 00 48";

    $scope.edidHeaderInfo = 'partials/edidHeaderInfo.html';
    $scope.chromacityCoords = 'partials/chromacityCoords.html';

    $scope.parseEdid = function() {
    // Remove 0x, and Commas
    $scope.scrubbedEdid = $scope.originalEdid.replace(/,/g," ").replace(/0x/g,"").toUpperCase();

    $scope.edid = new Edid($scope.scrubbedEdid);
    $scope.edid.parse();
    if($scope.edid.bdp.digitalInput == true)
    {
      $scope.bdpPage = 'partials/bdp/digital.html';
    }
    else
    {
      $scope.bdpPage = 'partials/bdp/analog.html';
    }
  };
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