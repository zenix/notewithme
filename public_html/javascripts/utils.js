'use strict';
nwmApplication.service('Utils', [function () {
    this.guid = function () {
        function randomString() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return (function () {
            return randomString() + randomString() + '-' + randomString() + '-' + randomString() + '-' +
                randomString() + '-' + randomString() + randomString() + randomString();
        })();
    };
}]);