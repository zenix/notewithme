// spec.js
//https://github.com/angular/protractor/blob/master/docs/tutorial.md
describe('in main page', function() {
  it('front page loads', function() {
    browser.get('http://localhost:3000/#/');
    expect(browser.getTitle()).toEqual('notewithme');
  });
});