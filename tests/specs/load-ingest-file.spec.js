const path = require('path');
const ec = protractor.ExpectedConditions;
const ingestFile = {relativePath: '../files/NuclearSpectroscopy.xml'};

describe('An existing, valid Ingest LDD file', function() {
    it('should pass a test', () => {
        expect(true).toBe(true);
    });
    
    it('can be loaded into LD3 tool', done => {
        browser.get(browser.baseUrl);
        
        element(by.id('inputfile')).sendKeys(path.resolve(__dirname,ingestFile.relativePath));
        
        element(by.css('[value="Visualize with LD3 Tool"]')).click();
        
        browser.sleep(1000);
        browser.waitForAngularEnabled(true);
        
        expect(browser.getCurrentUrl()).toMatch(/graph/g);
        done();
    });
});