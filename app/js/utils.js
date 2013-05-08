
function scrubHexData(hexData)
{
  var scrubbedHexData;

  // Remove commas, replace with spaces
  scrubbedHexData = hexData.replace(/,/g,' ');
  // Remove 0x for hex
  scrubbedHexData = scrubbedHexData.replace(/0x/g,' ');
  // Replace Tabs
  scrubbedHexData = scrubbedHexData.replace('\t',' ');
  // Remove all line returns
  scrubbedHexData = scrubbedHexData.replace(/(\r\n|\n|\r)/gm,' ');
  // Remove multiple spaces
  scrubbedHexData = scrubbedHexData.replace( / +/g,' ');
  // Make hex upper case
  scrubbedHexData = scrubbedHexData.toUpperCase();
  // Trim Leading and ending white space
  scrubbedHexData = scrubbedHexData.trim();
  // Convert to string array
  scrubbedHexData = scrubbedHexData.split(" ");

  return scrubbedHexData;
}


function convertToIntArray(stringArray)
{
  var arrayData = [];
  for(var i=0; i<stringArray.length; i++)
  {
    // Parse Hex
    arrayData[i] = parseInt(stringArray[i], 16);
  }
  return arrayData;
}

function convertToHexString(dataArray, addCommas, addHex, addLineBreaks)
{
  var comma;
  var newLine;
  var hexPrefix;
  var hexString = new Array();
  var lastByte = dataArray.length - 1;
  for(var index = 0; index < dataArray.length; index++)
  {
    if(addCommas && (index != lastByte))
    {
      comma = ",";
    }
    else
    {
      comma = ""
    }

    if(addHex)
    {
      hexPrefix = "0x";
    }
    else
    {
      hexPrefix = "";
    }
    if(addLineBreaks && ((index % 16) == 15) && (index != lastByte))
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
    hexString[index] = hexPrefix+pad(dataArray[index].toString(16).toUpperCase(),2)+comma+newLine;
  }

  return hexString.join(" ");
}

function pad(num, size)
{
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}