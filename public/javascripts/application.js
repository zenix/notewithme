'use strict';

var application = angular.module('notewithme', ['notewithmeServices']);

application.controller('MainCtrl', ['$scope', 'SocketIoService',
    function ($scope, SocketIoService) {
        $scope.text = '';
        var socket = SocketIoService.socket();
        var msg = {};
        msg.nick = 'zenix';
        msg.position = '0.0';

        $scope.keypressedBackSpace = function (keycode) {
            if (keycode == 8) {
                msg.text = '';
                msg.cursorposition = $scope.textCursorPosition.get;
                socket.emit('removechar', msg);
            }
        };

        $scope.keypressed = function (keyCode) {
            msg.text = String.fromCharCode(keyCode);
            msg.cursorposition = $scope.textCursorPosition.get;
            socket.emit('addchar', msg);
        }

        socket.on('addchar', function (message) {
            $scope.message = message;
            var text = $scope.text;
            var cursorposition = message.cursorposition;
            $scope.text = text.substr(0, cursorposition) + message.text + text.substr(cursorposition, text.length);
            $scope.$apply();
        });

        socket.on('removechar', function (message) {
            var text = $scope.text;
            var cursorposition = message.cursorposition;
            $scope.text = text.substring(0, cursorposition - 1) + text.substr(cursorposition, text.length);
            $scope.$apply();
        });
    }]);

application.directive('ebCaret', function() {

    function getPos(element) {
        if ('selectionStart' in element) {
            return element.selectionStart;
        } else if (document.selection) {
            element.focus();
            var sel = document.selection.createRange();
            var selLen = document.selection.createRange().text.length;
            sel.moveStart('character', -element.value.length);
            return sel.text.length - selLen;
        }
    }

    function setPos(element, caretPos) {
        if (element.createTextRange) {
            var range = element.createTextRange();
            range.move('character', caretPos);
            range.select();
        } else {
            element.focus();
            if (element.selectionStart !== undefined) {
                element.setSelectionRange(caretPos, caretPos);
            }
        }
    }

    return {
        restrict: 'A',
        scope: {
            ebCaret: '=',
        },
        link: function(scope, element, attrs) {
            if (!scope.ebCaret) scope.ebCaret = {};

            element.on('keydown keyup click', function(event) {
                scope.$apply(function() {
                    scope.ebCaret.get = getPos(element[0]);
                });
            });
            scope.$watch('ebCaret.set', function(newVal) {
                if (typeof newVal === 'undefined') return;
                setPos(element[0], newVal);
            });
        }
    };
});

application.directive("drawing", ['SocketIoService', '$window', function (SocketIoService, $window) {
    return {
        restrict: "A",
        link: function (scope, element) {
            var ctx = element[0].getContext('2d');
            ctx.canvas.width = $window.innerWidth;
            ctx.canvas.height = $window.innerHeight;
            SocketIoService.socket().on('draw', function (message) {
                ctx.beginPath();
                // line from
                ctx.moveTo(message.x, message.y);
                // to
                ctx.lineTo(message.cX, message.cY);
                // color
                ctx.strokeStyle = "#4bf";
                ctx.closePath();
                // draw it
                ctx.stroke();
            });

            // variable that decides if something should be drawn on mousemove
            var drawing = false;

            // the last coordinates before the current move
            var lastX;
            var lastY;

            element.bind('mousedown', function (event) {
                if (event.offsetX !== undefined) {
                    lastX = event.offsetX;
                    lastY = event.offsetY;
                } else { // Firefox compatibility
                    lastX = event.layerX - event.currentTarget.offsetLeft;
                    lastY = event.layerY - event.currentTarget.offsetTop;
                }

                // begins new line
                ctx.beginPath();

                drawing = true;
            });
            element.bind('mousemove', function (event) {
                if (drawing) {
                    var currentX;
                    var currentY;
                    // get current mouse position
                    if (event.offsetX !== undefined) {
                        currentX = event.offsetX;
                        currentY = event.offsetY;
                    } else {
                        currentX = event.layerX - event.currentTarget.offsetLeft;
                        currentY = event.layerY - event.currentTarget.offsetTop;
                    }

                    draw(lastX, lastY, currentX, currentY);

                    // set current coordinates to last one
                    lastX = currentX;
                    lastY = currentY;
                }

            });
            element.bind('mouseup', function (event) {
                // stop drawing
                drawing = false;
            });

            // canvas reset
            function reset() {
                element[0].width = element[0].width;
            }

            function draw(lX, lY, cX, cY) {
                var msg = {};
                msg.x = lX;
                msg.y = lY;
                msg.cX = cX;
                msg.cY = cY;
                SocketIoService.socket().emit('draw', msg);
                ctx.beginPath();
                // line from
                ctx.moveTo(lX, lY);
                // to
                ctx.lineTo(cX, cY);
                // color
                ctx.strokeStyle = "#4bf";
                ctx.closePath();
                // draw it
                ctx.stroke();
            }
        }
    };
}]);