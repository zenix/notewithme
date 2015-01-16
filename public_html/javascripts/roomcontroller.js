'use strict';
nwmApplication.controller('roomController', ['$scope', '$location', '$routeParams', '$compile', '$window', 'SocketIoService', 'UserService', 'CanvasService', function ($scope, $location, $routeParams, $compile, $window, SocketIoService, UserService, CanvasService) {
    if (UserService.isEmpty()) {
        $scope.modal = {};
        $scope.modal.show = true;
        $scope.modal.title = 'Please fill name and you\'re free to go.';
        trackOpenLinkModal();
        watchModalSubmit();
    } else {
        start();
    }

    function trackOpenLinkModal() {
        ga('send', 'event', 'User Path', 'Link', 'Modal');
    }

    function trackStartFromLink() {
        ga('send', 'event', 'User Path', 'Link Modal', 'Start');
    }

    function start() {
        initializeCanvasToolOptions();
        watchCanvasToolModel();
       // watchCanvasToolsService();
        CanvasService.start($scope);
    }

    function initializeCanvasToolOptions() {
        $scope.canvasToolOptions = CanvasService.canvasTools();
        //$scope.canvasToolModel = CanvasService.findActiveCanvasTool().name;
    }

    function watchCanvasToolModel() {
        $scope.$watch('canvasToolModel', function (newState, oldState) {
            if(newState) {
                CanvasService.setActiveCanvasTool(newState.name);
                CanvasService.calculateOffset();
            }
        });
    }

    function watchCanvasToolsService() {
        $scope.$watch(function () { return CanvasService.canvasTools()}, function () {
            $scope.canvasToolModel = CanvasService.findActiveCanvasTool().name;
        }, true);
    }

    function watchModalSubmit() {
        $scope.$watch('modalsubmit', function (newValue, oldValue) {
            if (newValue) {
                UserService.user().name = newValue.name;
                UserService.user().room = $routeParams.roomName;
                trackStartFromLink();
                start();
            }
        })
    }
}]);