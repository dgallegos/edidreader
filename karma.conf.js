module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
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
      // Legacy tests
      'test/unit/controllersSpec.js',
      'test/unit/directivesSpec.js',
      'test/unit/filtersSpec.js',
      'test/unit/servicesSpec.js'
    ],
    exclude: [],
    preprocessors: {},
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity
  });
};