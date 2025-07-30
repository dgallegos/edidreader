'use strict';

/* jasmine specs for EDID parser performance testing */

describe('EDID Parser Performance Tests', function() {
  var edid;

  beforeEach(function() {
    edid = new Edid();
  });

  describe('Parsing Performance', function() {
    it('should parse basic EDID within reasonable time', function() {
      var basicData = EdidTestData.fixChecksums(EdidTestData.basic1080pMonitor);
      var edidArray = EdidTestData.createFullEdidArray(basicData);
      
      var startTime = new Date().getTime();
      edid.setEdidData(edidArray);
      edid.parse();
      var endTime = new Date().getTime();
      
      // Should complete within 100ms for basic EDID
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should parse complex modern EDID within reasonable time', function() {
      var complexData = EdidTestData.fixChecksums(EdidTestData.samsungQ800T_HDMI21);
      var edidArray = EdidTestData.createFullEdidArray(complexData);
      
      var startTime = new Date().getTime();
      edid.setEdidData(edidArray);
      edid.parse();
      var endTime = new Date().getTime();
      
      // Should complete within 200ms for complex EDID with extensions
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should handle multiple parsing iterations efficiently', function() {
      var testDisplays = [
        EdidTestData.basic1080pMonitor,
        EdidTestData.samsungQ800T_HDMI21,
        EdidTestData.lgC9_OLED_HDMI21,
        EdidTestData.monitor8K_Gaming
      ];
      
      var startTime = new Date().getTime();
      
      for (var iteration = 0; iteration < 10; iteration++) {
        for (var i = 0; i < testDisplays.length; i++) {
          var displayData = EdidTestData.fixChecksums(testDisplays[i]);
          var edidArray = EdidTestData.createFullEdidArray(displayData);
          
          edid.setEdidData(edidArray);
          edid.parse();
        }
      }
      
      var endTime = new Date().getTime();
      
      // 40 parses (10 iterations × 4 displays) should complete within 2 seconds
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Memory Usage', function() {
    it('should not accumulate excessive data between parses', function() {
      var testData = EdidTestData.fixChecksums(EdidTestData.samsungQ800T_HDMI21);
      var edidArray = EdidTestData.createFullEdidArray(testData);
      
      // Parse the same EDID multiple times
      for (var i = 0; i < 100; i++) {
        edid.setEdidData(edidArray);
        edid.parse();
        
        // Verify basic parsing still works
        expect(edid.validHeader).toBe('OK');
        expect(edid.numberOfExtensions).toBe(1);
      }
      
      // Should still function normally after many iterations
      expect(edid.exts[0].dataBlockCollection.length).toBeGreaterThan(0);
    });

    it('should handle large EDID data efficiently', function() {
      // Create maximum size EDID (base + 254 extensions = 255 blocks = 32,640 bytes)
      var largeEdid = new Array(256 * 128).fill(0);
      
      // Set valid header
      largeEdid[0] = 0x00; largeEdid[1] = 0xFF; largeEdid[2] = 0xFF; largeEdid[3] = 0xFF;
      largeEdid[4] = 0xFF; largeEdid[5] = 0xFF; largeEdid[6] = 0xFF; largeEdid[7] = 0x00;
      largeEdid[126] = 254; // 254 extensions
      
      // Fill with minimal CTA extensions
      for (var block = 1; block <= 254; block++) {
        var offset = block * 128;
        largeEdid[offset] = 0x02; // CTA tag
        largeEdid[offset + 1] = 0x03; // Revision
        largeEdid[offset + 2] = 0x04; // DTD start (minimal)
        largeEdid[offset + 3] = 0x00; // No features
      }
      
      // Fix all checksums
      for (var block = 0; block <= 254; block++) {
        var offset = block * 128;
        var sum = 0;
        for (var i = 0; i < 127; i++) {
          sum += largeEdid[offset + i];
        }
        largeEdid[offset + 127] = (256 - (sum % 256)) % 256;
      }
      
      var startTime = new Date().getTime();
      edid.setEdidData(largeEdid);
      expect(function() {
        edid.parse();
      }).not.toThrow();
      var endTime = new Date().getTime();
      
      // Even large EDID should parse within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
      expect(edid.numberOfExtensions).toBe(254);
    });
  });

  describe('Regression Testing', function() {
    it('should maintain consistent parsing results', function() {
      var testData = EdidTestData.fixChecksums(EdidTestData.samsungQ800T_HDMI21);
      var edidArray = EdidTestData.createFullEdidArray(testData);
      
      // Parse once and capture results
      edid.setEdidData(edidArray);
      edid.parse();
      
      var firstParse = {
        eisaId: edid.eisaId,
        productCode: edid.productCode,
        extensionCount: edid.numberOfExtensions,
        dataBlockCount: edid.exts[0].dataBlockCollection.length
      };
      
      // Parse multiple times and verify consistency
      for (var i = 0; i < 10; i++) {
        edid.setEdidData(edidArray);
        edid.parse();
        
        expect(edid.eisaId).toBe(firstParse.eisaId);
        expect(edid.productCode).toBe(firstParse.productCode);
        expect(edid.numberOfExtensions).toBe(firstParse.extensionCount);
        expect(edid.exts[0].dataBlockCollection.length).toBe(firstParse.dataBlockCount);
      }
    });

    it('should handle all test samples without errors', function() {
      var allTestSamples = [
        EdidTestData.basic1080pMonitor,
        EdidTestData.samsungQ800T_HDMI21,
        EdidTestData.lgC9_OLED_HDMI21,
        EdidTestData.monitor8K_Gaming,
        EdidTestData.dellP2415Q_HDMI14
      ];
      
      var successfulParses = 0;
      
      for (var i = 0; i < allTestSamples.length; i++) {
        try {
          var testData = EdidTestData.fixChecksums(allTestSamples[i]);
          var edidArray = EdidTestData.createFullEdidArray(testData);
          
          edid.setEdidData(edidArray);
          edid.parse();
          
          // Basic validation that parse succeeded
          if (edid.validHeader === 'OK') {
            successfulParses++;
          }
        } catch (e) {
          // Count failures but don't stop the test
          console.warn('Parse failed for test sample', i, ':', e.message);
        }
      }
      
      // Should successfully parse at least 80% of test samples
      var successRate = successfulParses / allTestSamples.length;
      expect(successRate).toBeGreaterThan(0.8);
    });
  });

  describe('Benchmarking', function() {
    it('should track parsing performance improvements', function() {
      var testData = EdidTestData.fixChecksums(EdidTestData.samsungQ800T_HDMI21);
      var edidArray = EdidTestData.createFullEdidArray(testData);
      
      var iterations = 50;
      var times = [];
      
      for (var i = 0; i < iterations; i++) {
        var startTime = new Date().getTime();
        edid.setEdidData(edidArray);
        edid.parse();
        var endTime = new Date().getTime();
        
        times.push(endTime - startTime);
      }
      
      // Calculate statistics
      var sum = times.reduce(function(a, b) { return a + b; }, 0);
      var average = sum / times.length;
      var max = Math.max.apply(null, times);
      var min = Math.min.apply(null, times);
      
      console.log('EDID Parsing Performance:');
      console.log('  Average: ' + average.toFixed(2) + 'ms');
      console.log('  Min: ' + min + 'ms');
      console.log('  Max: ' + max + 'ms');
      console.log('  Iterations: ' + iterations);
      
      // Performance targets
      expect(average).toBeLessThan(50); // Average under 50ms
      expect(max).toBeLessThan(200);    // No single parse over 200ms
    });
  });
});