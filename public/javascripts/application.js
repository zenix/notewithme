'use strict';

var application = angular.module('notewithme', ['notewithmeServices', 'notewithmeDirectives']);

application.controller('MainCtrl', ['$scope', '$window', 'SocketIoService',
    function ($scope, $window, SocketIoService) {
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
            socket.emit('addObject', fabricObjectJson);

            attachListenerstoGroup(fabricObject);
        })

        canvas.on('path:created', function(options){
            var fabricObject = options.path;
            fabricObject.objectId = guid();
            var fabricObjectJson = JSON.stringify(fabricObject);
            socket.emit('addObject', fabricObjectJson);
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
                    fontSize: '12',
                    fontFamily: 'Arial'
                });

                iText.objectId = guid();

                var iTextJson = JSON.stringify(iText);
                socket.emit('addObject', iTextJson);
                attachListenersToiText(iText);
                canvas.calcOffset();
                canvas.add(iText);
                canvas.renderAll();
                console.log(canvas.getObjects())

            };

        });

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return (function() {
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            })();
        };




        function attachListenersToiText(iText){
            iText.on('text:changed', function(event){
                socket.emit('writing', {'objectId':iText.objectId,'text':iText.text});
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
                socket.emit('moving', {'objectId':fabricObject.objectId,'left': fabricObject.left, 'top': fabricObject.top,'originX': fabricObject.originX, 'originY':fabricObject.originY})
            });

            fabricObject.on('rotating', function(event){
                socket.emit('rotating',{'objectId':fabricObject.objectId, 'angle':fabricObject.angle,'originX': fabricObject.originX, 'originY':fabricObject.originY, 'left': fabricObject.left, 'top': fabricObject.top});
            });

            fabricObject.on('scaling', function(event){
                socket.emit('scaling', {'objectId': fabricObject.objectId, 'originX': fabricObject.originX, 'originY':fabricObject.originY, 'scaleX': fabricObject.scaleX, 'scaleY':fabricObject.scaleY, 'left': fabricObject.left, 'top': fabricObject.top});
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
                        canvas.getObjects().forEach(function(element){
                            toRemove.push(element);
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
    }]);
