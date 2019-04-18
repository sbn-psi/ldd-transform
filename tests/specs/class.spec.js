const path = require('path');
const ec = protractor.ExpectedConditions;

const ingestFile = {
    relativePath: '../files/NuclearSpectroscopy.xml'
};

const ActiveNode = function(element) {
    return {
        modalElement: element,
        isDisplayed: () => {
            return element.isDisplayed()
        }
    };
};

const select = {
    classNode: function(done) {
        element.all(by.css('[data-class="true"]')).then(elements => {
            const activeNode = new ActiveNode(element(by.id('active-node')));
            expect(activeNode.isDisplayed()).toBeFalsy();
            elements[0].click();
            expect(activeNode.isDisplayed()).toBeTruthy();
            done();
        });
    }
};

describe('A user', () => {
    it('can define a new CLASS element', done => {
        select.classNode(() => {
            // open add class form
            element(by.id('add-class')).click();
            
            // fill form values
            // name
            element(by.css('[ng-model="pds4Keyword"]#name')).sendKeys('Test_Class');
            // definition
            element(by.css('[ng-model="pds4Keyword"]#definition')).sendKeys('This is a test definition for a test class.');
            // maximum occurrences
            element(by.css('[ng-model="pds4Keyword"]#maximum_occurrences')).sendKeys('3');
            
            // submit form
            element(by.css('[ng-click="form.addClass()"]')).click();
            
            // wait for animations
            browser.sleep(2000);
            
            // test that new class is present in D3 tree
            expect(element(by.id('grns-Test_Class')).isDisplayed()).toBeTruthy();
            done();
        });
    });
    
    xit('can modify an existing CLASS element', () => {
        
    });
});