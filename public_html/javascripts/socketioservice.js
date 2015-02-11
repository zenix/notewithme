'use strict';
nwmApplication.service('SocketIoService', function () {
        var socket = io();
        var self = this;
        this.socket = function () {
            return socket;
        }

        this.send = function(){
            function addObject(message){
                emit('addObject', message);
            };
            function removeObject(message){
                emit('removeObject', message);
            };
            function writing(message){
                emit('writing', message);
            };
            function moving(message){
                emit('moving', message);
            };
            function rotating(message){
                emit('rotating', message);
            };
            function scaling(message){
                emit('scaling', message);
            };
            function saveCanvas(message){
                emit('saveCanvas', message);
            };
            function syncClient(message){
                emit('syncClient',message);
            };
            function joinRoom(user) {
                emit('joinRoom', user);
            };
            function emit(action, message){
                socket.emit(action,message);
            };

            return {
                addObject : addObject,
                removeObject: removeObject,
                writing : writing,
                moving: moving,
                rotating : rotating,
                scaling:scaling,
                saveCanvas:saveCanvas,
                syncClient:syncClient,
                joinRoom:joinRoom
            }
        };

        this.reconnect = function (user) {
            socket.on('connect', function(){ self.send().joinRoom(user) });
        };
        this.syncClient = function (fn) {
            socket.on('syncClient', fn);
        };
        this.updateCanvas = function (fn) {
            socket.on('updateCanvas', fn);
        };
        this.writing = function (fn) {
            socket.on('writing', fn);
        };
        this.moving = function (fn) {
            socket.on('moving', fn);
        };
        this.rotating = function (fn) {
            socket.on('rotating', fn);
        };
        this.scaling = function (fn) {
            socket.on('scaling', fn);
        };
        this.addObject = function (fn) {
            socket.on('addObject', fn);
        };
        this.removeObject = function (fn) {
            socket.on('removeObject', fn);
        };
        this.messageChannel = function(fn){
            socket.on('messageChannel', fn);
        };
    }
);