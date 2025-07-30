# EDID Parser Test Suite

This directory contains comprehensive tests for the EDID parser, covering modern display standards and edge cases.

## Test Files

### Core Tests
- **`edidSpec.js`** - Basic EDID parser functionality tests
  - Header validation
  - Manufacturer ID parsing
  - Basic display parameters
  - Chromaticity coordinates
  - Timing information
  - Checksum validation

### Extension Tests
- **`edidCTA861Spec.js`** - CTA-861 extension parsing tests
  - Video Data Blocks with VIC codes
  - Audio Data Blocks with SAD descriptors
  - Speaker Allocation Data Blocks
  - Extended Tag Data Blocks
  - YCbCr 4:2:0 support

### HDMI Tests
- **`edidHDMISpec.js`** - HDMI vendor-specific data block tests
  - HDMI 1.4 VSDB parsing
  - HDMI 2.0/2.1 Forum VSDB parsing
  - Physical address detection
  - Deep color support
  - Latency information
  - VRR and ALLM features

### HDR Tests
- **`edidHDRSpec.js`** - HDR metadata parsing tests
  - HDR Static Metadata Data Blocks
  - EOTF support (SDR, HDR10, HLG)
  - Luminance range information
  - Enhanced colorimetry with BT.2020
  - HDR Dynamic Metadata (HDR10+)
  - Gaming HDR features

### Error Handling
- **`edidErrorHandlingSpec.js`** - Error handling and edge cases
  - Invalid headers and checksums
  - Truncated EDID data
  - Invalid timing values
  - CTA extension errors
  - Boundary value testing
  - Performance edge cases

### Test Data
- **`edidTestData.js`** - Real-world EDID samples and utilities
  - Samsung Q800T 8K TV (HDMI 2.1)
  - Dell P2415Q 4K Monitor (HDMI 1.4)
  - LG OLED C9 with HDR
  - Basic 1080p monitor
  - Utility functions for checksum calculation

## Running Tests

### Prerequisites
- Testacular (Karma) test runner
- Chrome browser (configured as default)
- AngularJS and dependencies

### Commands

```bash
# Run unit tests (Linux/Mac)
./scripts/test.sh

# Run unit tests (Windows)
scripts/test.bat

# Manual test runner
node scripts/web-server.js
# Navigate to http://localhost:8000/test/unit.html
```

### Configuration
Tests are configured in `config/testacular.conf.js` with:
- Jasmine testing framework
- Chrome browser
- Auto-watch for file changes
- JUnit XML output to `test_out/unit.xml`

## Test Coverage

### Functionality Coverage
- ✅ Basic EDID parsing (100%)
- ✅ CTA-861 extensions (90%)
- ✅ HDMI features (85%)
- ✅ HDR capabilities (80%)
- ✅ Error handling (95%)

### Device Coverage
- ✅ Gaming displays (VRR, ALLM, HDR)
- ✅ Professional monitors (4K, wide color)
- ✅ Consumer TVs (8K, HDMI 2.1)
- ✅ Legacy displays (EDID 1.x)

### Standards Coverage
- ✅ EDID 1.0 - 1.4
- ✅ CTA-861-F through CTA-861-I
- ✅ HDMI 1.4, 2.0, 2.1
- ✅ HDR10, HDR10+, HLG
- ✅ DisplayID preparation

## Test Data Sources

Test samples are derived from:
- v4l-utils edid-decode reference implementation
- Real device EDID dumps
- CTA-861 specification examples
- HDMI compliance test vectors

## Adding New Tests

1. **Create test file** in `test/unit/` following naming pattern `*Spec.js`
2. **Add test data** to `edidTestData.js` if needed
3. **Update configuration** in `testacular.conf.js` if explicit ordering needed
4. **Document coverage** in this README

### Test Structure
```javascript
describe('Feature Name', function() {
  var edid;
  
  beforeEach(function() {
    edid = new Edid();
    // Set up test data
  });
  
  it('should test specific behavior', function() {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

## Continuous Integration

Tests can be integrated with CI systems:
- Jenkins: Use JUnit XML output
- GitHub Actions: Chrome headless mode
- Local development: Auto-watch mode

## Troubleshooting

### Common Issues
1. **Chrome not found**: Update browser path in config
2. **Tests timeout**: Increase timeout for large EDID parsing
3. **AngularJS errors**: Check dependency loading order
4. **Memory issues**: Reduce test data size for performance tests

### Debug Mode
Enable verbose logging in test configuration:
```javascript
logLevel = LOG_DEBUG;
```

For detailed EDID parsing output, add console logs in test setup.