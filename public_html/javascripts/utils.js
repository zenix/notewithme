'use strict';
nwmApplication.service('Utils', [function () {
    var self = this;
    this.guid = function () {
        return (function () {
            return self.randomString() + self.randomString() + '-' + self.randomString() + '-' + self.randomString() + '-' +
                self.randomString() + '-' + self.randomString() + self.randomString() + self.randomString();
        })();
    };

    this.randomString = function(){
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
}]);