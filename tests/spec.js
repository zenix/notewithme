// spec.js
//https://github.com/angular/protractor/blob/master/docs/tutorial.md
describe('angularjs homepage', function() {
  it('should have a title', function() {
    browser.get('http://juliemr.github.io/protractor-demo/');

    expect(browser.getTitle()).toEqual('Super Calculator');
  });
});