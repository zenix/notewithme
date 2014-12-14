'use strict';

var services = angular.module('notewithmeServices', []);
services.service('SocketIoService',function () {
        var socket;
        var namespace;
        this.connectRoom = function(room){
            console.log("connecting to " + room);
            namespace = room;
            socket = io(room);
        }

        this.socket = function (namespace) {
            return socket;
        }

        this.emit = function(action, message){
            socket.to(namespace).emit(action, message);
        }
    }
);

services.service('UserService', function(){
    var user = {};
    this.user = function(){
        return user;
    }
});