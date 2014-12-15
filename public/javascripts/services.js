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

    this.isEmpty = function(){
        return $.isEmptyObject(user);
    }
});

services.service('FabricService',['$routeParams', '$window', 'SocketIoService','UserService', function($routeParams, $window, SocketIoService,UserService){
    this.start = function($scope){

        SocketIoService.joinRoom(UserService.user());
        fabric.Object.prototype.toObject = (function(toObject) {
            return function() {
                return fabric.util.object.extend(toObject.call(this), {
                    objectId: this.objectId
                });
            };
        })(fabric.Object.prototype.toObject);

        $scope.canvasToolOptions = ['None', 'Write', 'Draw'];
        $scope.canvasToolModel = "Write";

        $scope.$watch('canvasToolModel', function(newState, oldState){
            if(newState === 'Draw'){
                canvas.isDrawingMode = true;
            } else if(newState === 'Write'){
                canvas.isDrawingMode = false;;
            } else {
                canvas.isDrawingMode = false;
            }
            canvas.calcOffset();
        });

        var socket = SocketIoService.socket();
        var canvas = new fabric.Canvas('mainCanvas');
        canvas.setWidth($window.innerWidth);
        canvas.setHeight($window.innerHeight);
        canvas.calcOffset();

        canvas.on('selection:created', function(options){
            var fabricObject = options.target;
            fabricObject.objectId = guid();
            var fabricObjectJson = JSON.stringify(fabricObject);
            SocketIoService.emit('addObject', fabricObjectJson);

            attachListenerstoGroup(fabricObject);
        })

        canvas.on('path:created', function(options){
            var fabricObject = options.path;
            fabricObject.objectId = guid();
            var fabricObjectJson = JSON.stringify(fabricObject);
            SocketIoService.emit('addObject', fabricObjectJson);
            attachListenersToPah(fabricObject)
        })

        canvas.on('mouse:down', function (options) {
            if (!options.target && $scope.canvasToolModel === 'Write') {
                $scope.canvasToolModel = 'None';
                $scope.$apply();

                var iText = new fabric.IText('edit',{
                    left: options.e.offsetX ? options.e.offsetX : options.e.layerX,
                    top: options.e.offsetY ? options.e.offsetY : options.e.layerY,
                    backgroundColor: '#FFFFFF',
                    fill: '#000000',
                    fontSize: '14',
                    fontFamily: 'Arial'
                });

                iText.objectId = guid();

                var iTextJson = JSON.stringify(iText);
                SocketIoService.emit('addObject', iTextJson);
                attachListenersToiText(iText);
                canvas.calcOffset();
                canvas.add(iText);
                canvas.renderAll();
            };

        });

        function randomString() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        function guid() {
            return (function() {
                return randomString() + randomString() + '-' + randomString() + '-' + randomString() + '-' +
                    randomString() + '-' + randomString() + randomString() + randomString();
            })();
        };




        function attachListenersToiText(iText){
            iText.on('text:changed', function(event){
                SocketIoService.emit('writing', {'objectId':iText.objectId,'text':iText.text});
            });
            attachCommonListeners(iText);
        };

        function attachListenersToPah(path){
            attachCommonListeners(path);
        }

        function attachListenerstoGroup(group){
            attachCommonListeners(group);
        }

        function attachCommonListeners(fabricObject){
            fabricObject.on('moving', function(event){
                SocketIoService.emit('moving', {'objectId':fabricObject.objectId,'left': fabricObject.left, 'top': fabricObject.top,'originX': fabricObject.originX, 'originY':fabricObject.originY})
            });

            fabricObject.on('rotating', function(event){
                SocketIoService.emit('rotating',{'objectId':fabricObject.objectId, 'angle':fabricObject.angle,'originX': fabricObject.originX, 'originY':fabricObject.originY, 'left': fabricObject.left, 'top': fabricObject.top});
            });

            fabricObject.on('scaling', function(event){
                SocketIoService.emit('scaling', {'objectId': fabricObject.objectId, 'originX': fabricObject.originX, 'originY':fabricObject.originY, 'scaleX': fabricObject.scaleX, 'scaleY':fabricObject.scaleY, 'left': fabricObject.left, 'top': fabricObject.top});
            });
        }

        function findObjectFromCanvasWith(objectId) {
            return canvas.getObjects().filter(function (object) {
                if (object.objectId === objectId) {
                    return true;
                }
                return false;
            })[0];
        }

        socket.on('connect', function(){
            SocketIoService.joinRoom(UserService.user());
        })

        socket.on('syncClient', function(message){
            SocketIoService.emit('syncClient', {clientId:message.clientId, canvas:JSON.stringify(canvas)});
        });

        socket.on('updateCanvas', function(message){
            canvas.loadFromJSON(message.canvas);
            canvas.renderAll();
        });

        socket.on('writing', function(message){
            var object = findObjectFromCanvasWith(message.objectId);
            object.text = message.text;
            canvas.renderAll();
        });

        socket.on('moving', function(message){
            var object = findObjectFromCanvasWith(message.objectId);
            object.top = message.top;
            object.left= message.left;
            object.originX = message.originX;
            object.originY = message.originY;
            canvas.renderAll();
        });

        socket.on('rotating', function(message){
            var object = findObjectFromCanvasWith(message.objectId);
            object.angle = message.angle;
            object.originX = message.originX;
            object.originY = message.originY;
            object.top = message.top;
            object.left= message.left;
            canvas.renderAll();
        });

        socket.on('scaling', function(message){
            var object = findObjectFromCanvasWith(message.objectId);
            object.scaleX = message.scaleX;
            object.scaleY = message.scaleY;
            object.top = message.top;
            object.left= message.left;
            object.originX = message.originX;
            object.originY = message.originY;
            canvas.renderAll();
        });

        socket.on('addObject', function(message){
            var jsonObject = JSON.parse(message);
            fabric.util.enlivenObjects([jsonObject], function(objects){
                var origRenderOnAddRemove = canvas.renderOnAddRemove;
                canvas.renderOnAddRemove = false;

                objects.forEach(function(fabricObject) {
                    if(fabricObject.type === 'i-text'){
                        attachListenersToiText(fabricObject);
                    }else if(fabricObject.type === 'path'){
                        attachListenersToPah(fabricObject);
                    }else if(fabricObject.type === 'group'){
                        var toRemove = [];
                        fabricObject._objects.forEach(function(element){
                            toRemove.push(findObjectFromCanvasWith(element.objectId));
                        });

                        toRemove.forEach(function(element){
                            canvas.remove(element);
                        });
                        attachListenerstoGroup(fabricObject);
                    }

                    canvas.add(fabricObject);
                });

                canvas.renderOnAddRemove = origRenderOnAddRemove;
                canvas.renderAll();
                canvas.calcOffset();
            });
        });

    }
}])