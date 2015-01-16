'use strict';
nwmApplication.service('SocketIoService', function () {
        var socket = io();
        this.joinRoom = function (user) {
            socket.emit('joinRoom', user);
        }
        this.socket = function () {
            return socket;
        }
        this.emit = function (action, message) {
            socket.emit(action, message);
        }
        this.reconnect = function (fn) {
            socket.on('connect', fn);
        }
        this.syncClient = function (fn) {
            socket.on('syncClient', fn);
        }
        this.updateCanvas = function (fn) {
            socket.on('updateCanvas', fn);
        }
        this.writing = function (fn) {
            socket.on('writing', fn);
        }
        this.moving = function (fn) {
            socket.on('moving', fn);
        }
        this.rotating = function (fn) {
            socket.on('rotating', fn);
        }
        this.scaling = function (fn) {
            socket.on('scaling', fn);
        }
        this.addObject = function (fn) {
            socket.on('addObject', fn);
        }
    }
);