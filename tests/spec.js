// spec.js
//https://github.com/angular/protractor/blob/master/docs/tutorial.md
describe('in main page', function() {
  beforeEach(function(){
    browser.get('http://localhost:3000/#/');
  })

  it('notewithme.com - start, share and collaborate', function() {
    expect(browser.getTitle()).toEqual('notewithme');
  });

  it('clicking start button modal opens', function(){
    element(by.css('.startModal')).click().then(function(){
      browser.sleep(300)
      expect(element(by.css('.modal-title')).getText()).toEqual('Just enter your name and room - you\'re free to start collaborating.');
    });
  })
});