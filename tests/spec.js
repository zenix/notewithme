// spec.js
//https://github.com/angular/protractor/blob/master/docs/tutorial.md
describe('in main page', function () {
    beforeEach(function () {
        browser.get('http://localhost:3000/#/');
    })

    it('title is correct', function () {
        expect(browser.getTitle()).toEqual('notewithme.com - start, share and collaborate');
    });

    function openAndGetMainPageModal() {
        return element(by.css('.startModal')).click();
    }

    function openCanvas(fn){
        openAndGetMainPageModal().then(function(){
            browser.sleep(300);
            element(modalNameByModel()).sendKeys('Jari Timonen');
            element(modalRoomByModel()).sendKeys('TestinRoom');
            element(modalStartByCss()).click().then(fn);
        })
    }


    function modalStartByCss() {
        return by.id('start');
    }

    function canvasByCss(){
        return by.css('#mainCanvas');
    }

    function modalNameByModel() {
        return by.model('user.name');
    }

    function modalRoomByModel() {
        return by.model('user.room');
    }

    it('clicking start button modal opens', function () {
        openAndGetMainPageModal().then(function () {
            browser.sleep(300);
            expect(element(by.css('.modal-title')).getText()).toEqual('Just enter your name and room and you\'re free to start collaborating.');
            expect(element.all(modalNameByModel()).count()).toEqual(1);
            expect(element.all(modalRoomByModel()).count()).toEqual(1);
        });
    });

    it('clicking start button and filling name and room leads to canvas with correct name/room', function(){
        openCanvas(function(){
            browser.sleep(200);
            expect(element.all(canvasByCss()).count()).toEqual(1);
        });
    });
});