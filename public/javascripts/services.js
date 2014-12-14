'use strict';

var services = angular.module('notewithmeServices', []);
services.service('SocketIoService',function () {
        var socket = io();
        var chatUser;
        this.joinRoom = function(user){
            chatUser = user;
            socket.emit('joinRoom',user);
        }

        this.socket = function (namespace) {
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