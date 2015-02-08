exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['tests/*.js'],
    framework: 'jasmine',
    capabilities: {
        browserName: 'chrome',
        platform: 'LINUX'
    }
}