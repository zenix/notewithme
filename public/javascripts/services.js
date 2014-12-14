'use strict';

var services = angular.module('notewithmeServices', []);
services.service('SocketIoService',function () {
        var socket = io();
        this.joinRoom = function(user){
            socket.emit('joinRoom',user);
        }
        this.socket = function(){
            return socket;
        }
        this.emit = function(action, message){
            socket.emit(action, message);
        }
    }
);

services.service('UserService', function(){
    var user = {};
    this.user = function(){
        return user;
    }
});