'use strict';

var application = angular.module('notewithme', ['notewithmeServices', 'notewithmeDirectives']);

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
