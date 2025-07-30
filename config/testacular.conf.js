basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'app/lib/angular/angular.js',
  'app/lib/angular/angular-*.js',
  'test/lib/angular/angular-mocks.js',
  'app/js/**/*.js',
  // Test data and utilities
  'test/unit/edidTestData.js',
  // Core EDID parser tests
  'test/unit/edidSpec.js',
  // CTA-861 extension tests
  'test/unit/edidCTA861Spec.js',
  // HDMI vendor-specific data block tests
  'test/unit/edidHDMISpec.js',
  // HDR metadata parsing tests
  'test/unit/edidHDRSpec.js',
  // Error handling and edge cases
  'test/unit/edidErrorHandlingSpec.js',
  // Integration tests for real-world EDID samples
  'test/unit/edidIntegrationSpec.js',
  // Validation and edge case tests
  'test/unit/edidValidationSpec.js',
  // Performance and benchmarking tests
  'test/unit/edidPerformanceSpec.js',
  // Legacy tests
  'test/unit/controllersSpec.js',
  'test/unit/directivesSpec.js',
  'test/unit/filtersSpec.js',
  'test/unit/servicesSpec.js'
];

autoWatch = true;

browsers = ['Chrome'];

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
