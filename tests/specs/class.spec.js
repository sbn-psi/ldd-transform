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
}

describe('A user', () => {
    it('can define a new CLASS element', done => {
        select.classNode(done);
    });
    
    xit('can modify an existing CLASS element', () => {
        
    });
});