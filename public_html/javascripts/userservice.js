'use strict';
nwmApplication.service('UserService', function () {
    var user = {};
    this.user = function () {
        return user;
    }
    this.isEmpty = function () {
        return $.isEmptyObject(user);
    }
});