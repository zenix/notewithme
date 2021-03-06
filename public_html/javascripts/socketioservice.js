'use strict';
nwmApplication.service('SocketIoService', ['FabricService', function (FabricService) {
        var socket = io();
        var self = this;
        this.socket = function () {
            return socket;
        }

        this.send = function(){
            function addObject(message){
                emit('addObject', message);
            }
            function removeObject(message){
                emit('removeObject', message);
            }
            function writing(message){
                emit('writing', message);
            }
            function moving(message){
                emit('moving', message);
            }
            function rotating(message){
                emit('rotating', message);
            }
            function scaling(message){
                emit('scaling', message);
            }
            function saveCanvas(message){
                emit('saveCanvas', message);
            }
            function syncClient(message){
                emit('syncClient',message);
            }
            function sendDownOneLayer(message){
                emit('sendDownOneLayer', message);
            }
            function bringUpOneLayer(message){
                emit('bringUpOneLayer', message);
            }
            function joinRoom(user) {
                //no need to timestamp, otherwise canvas is never read/updated
                socket.emit('joinRoom', user);
            }
            function emit(action, message){
                FabricService.createTimestampToCanvas();
                socket.emit(action,message);
            }

            return {
                addObject : addObject,
                removeObject: removeObject,
                writing : writing,
                moving: moving,
                rotating : rotating,
                scaling:scaling,
                saveCanvas:saveCanvas,
                syncClient:syncClient,
                joinRoom:joinRoom,
                sendDownOneLayer: sendDownOneLayer,
                bringUpOneLayer: bringUpOneLayer
            }
        };

        this.receive = function () {
            function reconnect (user) {
                on('connect', function () {
                    self.send().joinRoom(user)
                });
            }
            function syncClient (fn) {
                on('syncClient', fn);
            }
            function updateCanvas(fn) {
                on('updateCanvas', function(message){
                    var jsonServerCanvas = JSON.parse(message.canvas);
                    if(jsonServerCanvas && jsonServerCanvas.timestamp && parseInt(FabricService.getCanvasTimestamp()) > parseInt(jsonServerCanvas.timestamp)){
                        return;
                    }
                    fn(message);
                });
            }
            function writing(fn) {
                on('writing', fn);
            }
            function moving(fn) {
                on('moving', fn);
            }
            function rotating(fn) {
                on('rotating', fn);
            }
            function scaling(fn) {
                on('scaling', fn);
            }
            function addObject(fn) {
                on('addObject', fn);
            }
            function removeObject(fn) {
                on('removeObject', fn);
            }
            function messageChannel(fn) {
                socket.on('messageChannel', fn);
            }
            function sendDownOneLayer(fn){
                on('sendDownOneLayer', fn);
            }
            function bringUpOneLayer(fn){
                on('bringUpOneLayer', fn);
            }

            function on(action, fn){
                socket.on(action,fn);
            }
            return {
                reconnect: reconnect,
                syncClient: syncClient,
                updateCanvas: updateCanvas,
                writing: writing,
                moving:moving,
                rotating: rotating,
                scaling: scaling,
                addObject: addObject,
                removeObject: removeObject,
                messageChannel:messageChannel,
                sendDownOneLayer: sendDownOneLayer,
                bringUpOneLayer: bringUpOneLayer
            }
        }
    }]
);