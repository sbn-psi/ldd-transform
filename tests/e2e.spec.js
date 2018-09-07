const path = require('path');
var ec = protractor.ExpectedConditions;

describe('Protractor Tests', function() {

    beforeAll(function() {
        browser.waitForAngularEnabled(false);
    });

    afterAll(function() {
        browser.waitForAngularEnabled(true);
    });

    it('should be configured properly', function() {
        const file = path.resolve(__dirname,'./files/NuclearSpectroscopy.xml');

        browser.get('/');

        element(by.css('input[type="file"]')).sendKeys(file);
        element(by.id('vis-button')).click();

        browser.sleep(1500);

        expect(browser.getCurrentUrl()).toMatch(/graph/);
        expect(true).toEqual(true);
    });

});

describe('LD3 Tool', function() {

    it('should load an existing Ingest_LDD file', function() {
        expect(element.all(by.css('.node')).count()).toBe(7);
        expect(element.all(by.css('.link')).count()).toBe(6);
    });

    describe('should be able to modify LDD details', function() {

        const newDetails = {
            name: 'Updated Ingest_LDD Name',
            ldd_version_id: '9.9.9.9',
            full_name: 'Test Name',
            steward_id: 'test_steward_id',
            namespace_id: 'test_namespace',
            pds4_im_version: '1000',
            comment: 'test comment'
        };

        beforeEach(function() {
            element(by.css('[ng-click="ld3.editLdd()"]')).click();
        });

        const updateValue = function(keyword,value) {
            element(by.model('ldd.edit.' + keyword)).clear().sendKeys(value);
            element(by.css('[ng-click="ld3.saveLdd()"]')).click();
        };

        const checkValue = function(keyword,value) {
            const toggle = element(by.css('.show-ldd-details'));

            toggle.getText().then(text => {
                if (text == 'Show Details') toggle.click();

                const elem = element(by.model('ldd.edit.' + keyword));

                expect(elem.getAttribute('value')).toEqual(value);
            });
        };

        it('name', function() {
            const keyword = 'name';
            updateValue(keyword,newDetails[keyword]);
            checkValue(keyword,newDetails[keyword]);
        });

        it('version id', function() {
            const keyword = 'ldd_version_id';
            updateValue(keyword,newDetails[keyword]);
            checkValue(keyword,newDetails[keyword]);
        });

        it('full name', function() {
            const keyword = 'full_name';
            updateValue(keyword,newDetails[keyword]);
            checkValue(keyword,newDetails[keyword]);
        });

        it('steward id', function() {
            const keyword = 'steward_id';
            updateValue(keyword,newDetails[keyword]);
            checkValue(keyword,newDetails[keyword]);
        });

        it('namespace', function() {
            const keyword = 'namespace_id';
            updateValue(keyword,newDetails[keyword]);
            checkValue(keyword,newDetails[keyword]);
        });

        // it('PDS4 IM Version', function() {
        //     const keyword = 'pds4_im_version';
        //     updateValue(keyword,newDetails[keyword]);
        //     checkValue(keyword,newDetails[keyword]);
        // });

        it('comment', function() {
            const keyword = 'comment';
            updateValue(keyword,newDetails[keyword]);
            checkValue(keyword,newDetails[keyword]);
        });

    });

});
