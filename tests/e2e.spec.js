const path = require('path');
var ec = protractor.ExpectedConditions;
const ldd = {
    original: {
        name: 'Original Ingest_LDD',
        full_name: 'Johnny Appleseed',
        steward_id: 'original_steward_id',
        namespace_id: 'original_namespace_id'
    },
    updated: {
        name: 'Updated Ingest_LDD Name',
        ldd_version_id: '9.9.9.9',
        full_name: 'Updated Name',
        steward_id: 'updated_steward_id',
        namespace_id: 'updated_namespace',
        comment: 'Updated comment.'
    }
};
const classes = [{
    name: 'Test_Class_One',
    definition: 'This is a test definition for Test_Class_One.'
},
{
    name: 'Test_Class_Two',
    definition: 'This is a test definition for Test_Class_Two.',
    minimum_occurrences: '0',
    maximum_occurrences: '1'
}];
const attributes = [{
    name: 'test_attribute_one',
    definition: 'This is a test definition for test_attribute_one.',
    minimum_occurrences: '1',
    maximum_occurrences: '1',
    nillable_flag: false,
    enumeration_flag: false
}];
const file = path.resolve(__dirname,'./files/NuclearSpectroscopy.xml');
const updateValue = function(keyword,value) {
    element(by.model('ldd.edit.' + keyword)).clear().sendKeys(value);
    element(by.css('[ng-click="ld3.saveLdd()"]')).click();
    browser.waitForAngular();
};

const checkValue = function(keyword,value) {
    const toggle = element(by.css('.show-ldd-details'));

    toggle.getText().then(text => {
        if (text == 'Show Details') toggle.click();

        const elem = element(by.model('ldd.edit.' + keyword));

        expect(elem.getAttribute('value')).toEqual(value);
    });
};

describe('A user', function() {

    it('can create a new Ingest_LDD file from scratch', function() {
        browser.waitForAngularEnabled(false);
        browser.get('/');

        element(by.id('new-ldd')).click();

        browser.waitForAngularEnabled(true);

        element(by.model('ldd.edit.name')).sendKeys(ldd.original['name']);
        element(by.model('ldd.edit.full_name')).sendKeys(ldd.original['full_name']);
        element(by.model('ldd.edit.steward_id')).sendKeys(ldd.original['steward_id']);
        element(by.model('ldd.edit.namespace_id')).sendKeys(ldd.original['namespace_id']);

        element(by.css('[ng-click="ld3.saveLdd()"]')).click();

        browser.waitForAngular();

        element(by.model('newNode.name')).sendKeys(classes[0]['name']);
        element(by.model('newNode.definition')).sendKeys(classes[0]['definition']);

        element(by.css('[ng-click="ld3.addClass()"]')).click()

        expect(element.all(by.css('.node')).count()).toBe(1);
        expect(element.all(by.css('.link')).count()).toBe(0);
    });

    describe('can modify LDD', function() {

        beforeEach(function() {
            element(by.css('[ng-click="ld3.editLdd()"]')).click();
        });

        it('name', function() {
            const keyword = 'name';
            updateValue(keyword,ldd.updated[keyword]);
            checkValue(keyword,ldd.updated[keyword]);
        });

        it('version id', function() {
            const keyword = 'ldd_version_id';
            updateValue(keyword,ldd.updated[keyword]);
            checkValue(keyword,ldd.updated[keyword]);
        });

        it('full name', function() {
            const keyword = 'full_name';
            updateValue(keyword,ldd.updated[keyword]);
            checkValue(keyword,ldd.updated[keyword]);
        });

        it('steward id', function() {
            const keyword = 'steward_id';
            updateValue(keyword,ldd.updated[keyword]);
            checkValue(keyword,ldd.updated[keyword]);
        });

        it('comment', function() {
            const keyword = 'comment';
            updateValue(keyword,ldd.updated[keyword]);
            checkValue(keyword,ldd.updated[keyword]);
        });

    });

    it('can add a new class', function() {
        const parent = {};
        parent.lid = ldd.original.namespace_id + '-' + classes[0].name;
        parent.elem = element(by.id(parent.lid));

        // select parent class
        parent.elem.click();

        browser.waitForAngular();

        // click plus button
        const addNodeButton = element(by.css('[ng-click="ld3.openAddNodeModal()"]'));
        addNodeButton.click();

        // fill form
        element(by.model('newNode.name')).sendKeys(classes[1]['name']);
        element(by.model('newNode.definition')).sendKeys(classes[1]['definition']);
        element(by.model('newNode.minimum_occurrences')).sendKeys(classes[1]['minimum_occurrences']);
        element(by.model('newNode.maximum_occurrences')).sendKeys(classes[1]['maximum_occurrences']);

        // click save button
        element(by.css('[ng-click="ld3.addClass()"]')).click();

        expect(element.all(by.css('.node')).count()).toBe(2);
        expect(element.all(by.css('.link')).count()).toBe(1);
    });

    it('can add a new attribute', function() {
        const parent = {};
        parent.lid = ldd.original.namespace_id + '-' + classes[1].name;
        parent.elem = element(by.id(parent.lid));

        // select parent class
        parent.elem.click();

        browser.waitForAngular();

        // click plus button
        const addNodeButton = element(by.css('[ng-click="ld3.openAddNodeModal()"]'));
        addNodeButton.click();

        // fill form
        element(by.css('[ng-click="newNode.reference_type = \'attribute_of\'"]')).click();

        element(by.id('attribute-name')).sendKeys(attributes[0]['name']);
        element(by.id('attribute-definition')).sendKeys(attributes[0]['definition']);
        element(by.id('attribute-minimum_occurrences')).sendKeys(attributes[0]['minimum_occurrences']);
        element(by.id('attribute-maximum_occurrences')).sendKeys(attributes[0]['maximum_occurrences']);
        element(by.css(`[id="attribute-nillable_flag"][ng-value="${attributes[0]['nillable_flag']}"]`)).click();
        element(by.css(`[id="attribute-enumeration_flag"][ng-value="${attributes[0]['enumeration_flag']}"]`)).click();

        // click save button
        element(by.css('[ng-click="ld3.addAttribute()"]')).click();

        expect(element.all(by.css('.node')).count()).toBe(3);
        expect(element.all(by.css('.link')).count()).toBe(2);
    });

    it('can create a new link', function() {
        browser.refresh()
        browser.sleep(1500);

        expect(element.all(by.css('.node')).count()).toBe(3);
        expect(element.all(by.css('.link')).count()).toBe(2);

        const parent = {};
        parent.lid = ldd.original.namespace_id + '-' + classes[0].name;
        parent.elem = element(by.id(parent.lid));

        // select parent class
        parent.elem.click();

        browser.waitForAngular();

        // click linkMode button
        element(by.css('[ng-click="ld3.addLink()"]')).click();

        const child = {};
        child.lid = ldd.original.namespace_id + '-' + attributes[0].name;
        child.elem = element(by.id(child.lid));

        // select child attribute
        child.elem.click();

        browser.waitForAngular();

        // evaluate
        expect(element.all(by.css('.node')).count()).toBe(3);
        expect(element.all(by.css('.link')).count()).toBe(3);
    });

    it('can load an existing Ingest_LDD file', function() {
        browser.waitForAngularEnabled(false);

        browser.get('/');

        browser.executeScript('localStorage.clear()').then(function() {

            element(by.css('input[type="file"]')).sendKeys(file);
            element(by.id('vis-button')).click();

            browser.sleep(1000);

            expect(browser.getCurrentUrl()).toMatch(/graph/);

            expect(element.all(by.css('.node')).count()).toBe(7);
            expect(element.all(by.css('.link')).count()).toBe(6);

            browser.waitForAngularEnabled(true);

        })
    });

});
