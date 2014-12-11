'use strict';

var application = angular.module('notewithme', ['notewithmeServices', 'notewithmeDirectives']);

application.controller('MainCtrl', ['$scope', '$window', 'SocketIoService',
    function ($scope, $window, SocketIoService) {
        var socket = SocketIoService.socket();
        var canvas = new fabric.Canvas('mainCanvas');
        canvas.setWidth($window.innerWidth);
        canvas.setHeight($window.innerHeight);


        canvas.on('mouse:down', function (options) {
            if (!options.target && $scope.textElementSwitch) {
                $scope.textElementSwitch = false;
                $scope.$apply();
                var iText = new fabric.IText('edit',{
                    left: options.e.layerX,
                    top: options.e.layerY,
                    backgroundColor: '#FFFFFF',
                    fill: '#000000'
                });

                iText.toObject = (function(toObject) {
                    return function() {
                        return fabric.util.object.extend(toObject.call(this), {
                            textId: this.textId
                        });
                    };
                })(iText.toObject);

                iText.textId = guid();

                var iTextJson = JSON.stringify(iText);
                socket.emit('addTextElement', iTextJson);
                attachListenersToiText(iText);
                canvas.add(iText);
            }

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
                socket.emit('writing', {'textId':iText.textId,'text':iText.text});
            });
            iText.on('moving', function(event){
                socket.emit('moving', {'textId':iText.textId,'left': iText.left, 'top': iText.top})
            });

            iText.on('rotating', function(event){
                socket.emit('rotating',{'textId':iText.textId, 'angle':iText.angle,'originX': iText.originX, 'originY':iText.originY, 'left': iText.left, 'top': iText.top});
            });

            iText.on('scaling', function(event){
                socket.emit('scaling', {'textId': iText.textId, 'originX': iText.originX, 'originY':iText.originY, 'scaleX': iText.scaleX, 'scaleY':iText.scaleY, 'left': iText.left, 'top': iText.top});
            });

        };

        function addTextElementButton(){

        }

        function findObjectFromCanvasWith(textId) {
            return canvas.getObjects().filter(function (object) {
                if (object.textId === textId) {
                    return true;
                }
                return false;
            })[0];
        }

        socket.on('writing', function(message){
            var object = findObjectFromCanvasWith(message.textId);
            object.text = message.text;
            canvas.renderAll();
        });

        socket.on('moving', function(message){
            var object = findObjectFromCanvasWith(message.textId);
            object.top = message.top;
            object.left= message.left;
            canvas.renderAll();
        });

        socket.on('rotating', function(message){
            var object = findObjectFromCanvasWith(message.textId);
            object.angle = message.angle;
            object.originX = message.originX;
            object.originY = message.originY;
            object.top = message.top;
            object.left= message.left;
            canvas.renderAll();
        });

        socket.on('scaling', function(message){
            var object = findObjectFromCanvasWith(message.textId);
            object.scaleX = message.scaleX;
            object.scaleY = message.scaleY;
            object.top = message.top;
            object.left= message.left;
            object.originX = message.originX;
            object.originY = message.originY;
            canvas.renderAll();
        });

        socket.on('addTextElement', function(message){
            var jsonObject = JSON.parse(message);
            fabric.util.enlivenObjects([jsonObject], function(objects){
                var origRenderOnAddRemove = canvas.renderOnAddRemove;
                canvas.renderOnAddRemove = false;

                objects.forEach(function(o) {
                    attachListenersToiText(o);
                    canvas.add(o);
                });

                canvas.renderOnAddRemove = origRenderOnAddRemove;
                canvas.renderAll();
            });
        });
    }]);
