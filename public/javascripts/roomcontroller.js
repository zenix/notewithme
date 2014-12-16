'use strict';

nwmApplication.controller('roomController', ['$scope', '$location', '$routeParams', '$compile', '$window', 'SocketIoService','UserService','CanvasService', function($scope, $location, $routeParams, $compile, $window, SocketIoService, UserService,CanvasService){


    if(UserService.isEmpty()){

        $scope.modal = {};
        $scope.modal.show = true;
        $scope.modal.title = 'Please fill name and you\'re free to go.';
        watchModalSubmit();
    }else{
        start();
    }

    function start(){
        initializeCanvasToolOptions();
        watchCanvasToolModel();
        CanvasService.start($scope);
    }

    function initializeCanvasToolOptions() {
       $scope.canvasToolOptions = [
           {name: 'None', glyphiconicon: 'glyphicon-off'},
           {name: 'Write', glyphiconicon: 'glyphicon-font'},
           {name: 'Draw', glyphiconicon: 'glyphicon-pencil'}
       ];
       $scope.canvasToolModel = "Write";
    }

    function watchCanvasToolModel() {
        $scope.$watch('canvasToolModel', function (newState, oldState) {
            if (newState.name === 'Draw') {
                CanvasService.isDrawingMode(true);
            } else if (newState.name === 'Write') {
                CanvasService.isDrawingMode(false);
            } else {
                CanvasService.isDrawingMode(false);
            }
            CanvasService.calculateOffset();
        });
        }

    function watchModalSubmit() {
        $scope.$watch('modalsubmit', function (newValue, oldValue) {
            if (newValue) {
                UserService.user().name = newValue.name;
                UserService.user().room = $routeParams.roomName;
                start();
            }
        })
    }
}]);