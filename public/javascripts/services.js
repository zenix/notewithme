'use strict';
var socket = io();
var services = angular.module('notewithmeServices', []);
services.service('SocketIoService',function () {
        this.socket = function () {
            return socket;
        }
    }
);