// spec.js
//https://github.com/angular/protractor/blob/master/docs/tutorial.md
describe('in main page', function () {
    beforeEach(function () {
        browser.get('http://localhost:3000/#/');
    })

    it('title is correct', function () {
        expect(browser.getTitle()).toEqual('notewithme.com - start, share and collaborate');
    });

    it('clicking start button modal opens', function () {
        element(by.css('.startModal')).click().then(function () {
            browser.sleep(300);
            expect(element(by.css('.modal-title')).getText()).toEqual('Just enter your name and room and you\'re free to start collaborating.');

        });
    })
});