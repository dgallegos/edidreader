module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      // EDID Parser - the main code we're testing
      'app/js/edid.js',
      
      // Test data and utilities (no Angular dependencies)
      'test/unit/edidTestData.js',
      
      // EDID parser tests (will be refactored to remove Angular)
      'test/unit/edid-standalone/**/*.js'
    ],
    exclude: [
      // Exclude Angular-dependent files
      'test/unit/controllersSpec.js',
      'test/unit/directivesSpec.js',
      'test/unit/filtersSpec.js',
      'test/unit/servicesSpec.js',
      
      // Exclude original tests until refactored
      'test/unit/edidSpec.js',
      'test/unit/edidCTA861Spec.js',
      'test/unit/edidHDMISpec.js',
      'test/unit/edidHDRSpec.js',
      'test/unit/edidErrorHandlingSpec.js'
    ],
    preprocessors: {},
    reporters: ['progress', 'dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity,
    
    // Custom configuration for EDID testing
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    
    // Increase timeout for complex EDID parsing
    browserNoActivityTimeout: 60000,
    captureTimeout: 60000
  });
};