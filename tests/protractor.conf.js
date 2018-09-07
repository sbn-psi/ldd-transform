exports.config = {
    specs: [
        // global spec config/configure testing environment
        'e2e.spec.js',
    ],

    capabilities: {
        'browserName': 'chrome',
        'chromeOptions': {
            args: [
                '--window-size=1600,1200',
                '--inspect-brk'
            ]
        }
    },

    framework: 'jasmine2',

    onPrepare: function() {
        const jasmineReporters = require('jasmine-reporters');

        jasmine.getEnv().addReporter(new jasmineReporters.TerminalReporter({
            verbosity: 3,
            color: true,
            showStack: false
        }));

        jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
            savePath: 'tests/results/',
            consolidateAll: true
        }));

        browser.baseUrl = 'http://localhost:3001/';
        console.log(`Protractor baseUrl: ${browser.baseUrl}`);

        const failFast = require('jasmine-fail-fast');
        jasmine.getEnv().addReporter(failFast.init());

    }
}
