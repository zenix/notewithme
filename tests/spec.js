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
            element(modalStartById()).click().then(fn);
        })
    }


    function modalStartById() {
        return by.id('start');
    }

    function modalCloseById() {
        return by.id('close');
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

    function modalTitleByCss() {
        return by.css('.modal-title');
    }

    it('clicking start button modal opens', function () {
        openAndGetMainPageModal().then(function () {
            browser.sleep(300);
            expect(element(modalTitleByCss()).getText()).toEqual('Just enter your name and room and you\'re free to start collaborating.');
            expect(element(modalNameByModel()).isPresent()).toBe(true);
            expect(element(modalRoomByModel()).isPresent()).toBe(true);
        });
    });

   it('modal close works', function(){
        openAndGetMainPageModal().then(function () {
            browser.sleep(300);
            element(modalCloseById()).click();
            browser.sleep(300);
            expect(element(modalTitleByCss()).isDisplayed()).toBe(false);

        })
    });

    it('clicking start button and filling name and room leads to canvas with correct name/room', function(){
        openCanvas(function(){
            browser.sleep(200);
            expect(element(canvasByCss()).isPresent()).toBe(true);
        });
    });
});