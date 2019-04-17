const path = require('path');
const ec = protractor.ExpectedConditions;

const ingestFile = {
    relativePath: '../files/NuclearSpectroscopy.xml'
};

describe('Class specs', function() {
    browser.get(browser.baseUrl);
    
    element(by.id('inputfile')).sendKeys(path.resolve(__dirname,ingestFile.relativePath));
    
    browser.sleep(3000);
    
    it('should pass a test', () => {
        expect(true).toBe(true);
    });
});