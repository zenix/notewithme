
var notewithmeDirectives = angular.module('notewithmeDirectives', []);


notewithmeDirectives.directive('ebCaret', function() {

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

notewithmeDirectives.directive("drawing", ['SocketIoService', '$window', function (SocketIoService, $window) {
    return {
        restrict: "A",
        link: function (scope, element) {
            var ctx = element[0].getContext('2d');
            ctx.canvas.width = $window.innerWidth;
            ctx.canvas.height = $window.innerHeight;
            SocketIoService.socket().on('draw', function (message) {
                draw(message.x, message.y, message.cX, message.cY);
            });

            var drawing = false;

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
                drawing = true;
            });
            element.bind('mousemove', function (event) {
                if (drawing) {
                    var currentX;
                    var currentY;
                    if (event.offsetX !== undefined) {
                        currentX = event.offsetX;
                        currentY = event.offsetY;
                    } else {
                        currentX = event.layerX - event.currentTarget.offsetLeft;
                        currentY = event.layerY - event.currentTarget.offsetTop;
                    }

                    drawEmit(lastX, lastY, currentX, currentY);

                    // set current coordinates to last one
                    lastX = currentX;
                    lastY = currentY;
                }

            });
            element.bind('mouseup', function (event) {
                drawing = false;
            });

            function reset() {
                element[0].width = element[0].width;
            }

            function drawEmit(lX, lY, cX, cY) {
                var msg = {};
                msg.x = lX;
                msg.y = lY;
                msg.cX = cX;
                msg.cY = cY;
                SocketIoService.socket().emit('draw', msg);
                draw(lX, lY, cX, cY);
            }

            function draw(lX, lY, cX, cY){
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