'use strict';
var socket = io();
var services = angular.module('notewithmeServices', []);
services.service('SocketIoService',function () {
        this.socket = function () {
            return socket;
        }
    }
);

services.service('UserService', function(){
    var user = {};
    this.user = function(){
        return user;
    }
});