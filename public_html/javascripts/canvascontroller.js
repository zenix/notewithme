'use strict';
nwmApplication.controller('canvasController', ['$scope', '$location', '$routeParams', '$timeout', '$window', 'SocketIoService', 'UserService', 'CanvasService', function ($scope, $location, $routeParams, $timeout, $window, SocketIoService, UserService, CanvasService) {
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
        CanvasService.start($scope);
    }

    function initializeCanvasToolOptions() {
        $scope.canvasToolOptions = CanvasService.canvasTools();
    }

    function watchModalSubmit() {
        $scope.$watch('modalsubmit', function (newValue, oldValue) {
            if (newValue) {
                UserService.user().name = newValue.name;
                UserService.user().randomString = $routeParams.randomString;
                UserService.user().title = $routeParams.title;
                trackStartFromLink();
                start();
            }
        })
    }
}]);