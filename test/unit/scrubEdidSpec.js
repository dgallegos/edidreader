'use strict';

/* jasmine specs for scrubEdid function */

describe('scrubEdid function', function() {

  describe('Basic hex string handling', function() {
    it('should handle space-separated hex values', function() {
      var input = "00 FF FF FF FF FF FF 00";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });

    it('should handle comma-separated hex values', function() {
      var input = "00,FF,FF,FF,FF,FF,FF,00";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });

    it('should handle continuous hex string without separators', function() {
      var input = "00FFFFFFFFFFFFFF00";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });

    it('should handle newline-separated hex values', function() {
      var input = "00 FF FF FF\nFF FF FF 00";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });
  });

  describe('0x prefix handling', function() {
    it('should handle 0x prefixed hex values with commas', function() {
      var input = "0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });

    it('should handle 0x prefixed hex values with spaces', function() {
      var input = "0x00 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0x00";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });

    it('should handle mixed 0x and non-0x values', function() {
      var input = "0x00, FF, 0xFF, FF, 0xFF, FF, 0xFF, 00";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });

    it('should handle 0X uppercase prefix', function() {
      var input = "0X00, 0XFF, 0XFF, 0XFF";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF"]);
    });
  });

  describe('Case handling', function() {
    it('should convert lowercase hex to uppercase', function() {
      var input = "00 ff ff ff ff ff ff 00";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });

    it('should handle mixed case hex values', function() {
      var input = "00 Ff fF FF ff FF ff 00";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });
  });

  describe('Non-hex character removal', function() {
    it('should remove non-hex characters', function() {
      var input = "00 FF FF FF# FF FF FF 00!";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });

    it('should handle text mixed with hex', function() {
      var input = "Header: 00 FF FF FF Data: FF FF FF 00";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });

    it('should remove brackets and other punctuation', function() {
      var input = "[00] {FF} (FF) <FF> FF:FF;FF'00";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00"]);
    });
  });

  describe('Edge cases', function() {
    it('should handle single digit hex values', function() {
      var input = "0 F A B C D E F";
      var result = scrubEdid(input);
      expect(result).toEqual(["0F", "AB", "CD", "EF"]);
    });

    it('should handle empty input', function() {
      var input = "";
      var result = scrubEdid(input);
      expect(result).toEqual(null);
    });

    it('should handle only non-hex characters', function() {
      var input = "This is not hex!";
      var result = scrubEdid(input);
      expect(result).toEqual(null);
    });

    it('should handle odd number of hex characters', function() {
      var input = "00FFFFFFFFFFFFF"; // 15 characters
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "F"]);
    });
  });

  describe('Real EDID examples', function() {
    it('should handle Samsung EDID format', function() {
      var input = "00,FF,FF,FF,FF,FF,FF,00,4C,2D,9B,06,01,00,00,00," +
                  "33,13,01,03,80,59,32,78,0A,EE,91,A3,54,4C,99,26";
      var result = scrubEdid(input);
      expect(result.length).toBe(32);
      expect(result[0]).toBe("00");
      expect(result[8]).toBe("4C");
      expect(result[9]).toBe("2D");
    });

    it('should handle multi-line EDID with line numbers', function() {
      var input = "00 FF FF FF FF FF FF 00 4D D9 FA 06 00 00 00 00 \\n" +
                  "2D 0C 01 03 90 1F 11 00 EA A8 E0 99 57 4B 92 25 \\n" +
                  "1C 50 54 00 00 00 01 01 01 01 01 01 01 01 01 01";
      var result = scrubEdid(input);
      expect(result.length).toBe(48);
      expect(result[16]).toBe("2D");
      expect(result[32]).toBe("1C");
    });

    it('should handle EDID with 0x prefix format', function() {
      var input = "0x00 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0x00 0x4C 0x2D";
      var result = scrubEdid(input);
      expect(result).toEqual(["00", "FF", "FF", "FF", "FF", "FF", "FF", "00", "4C", "2D"]);
    });
  });
});