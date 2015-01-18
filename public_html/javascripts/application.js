'use strict';
var nwmApplication = angular.module('notewithme', ['ngRoute']);
nwmApplication.config(['$routeProvider', '$compileProvider', function ($routeProvider, $compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^data:image\//);
    $routeProvider.
        when('/room/:roomName', {
            templateUrl: 'partials/room.html',
            controller: 'roomController'
        }).
        when('/', {
            templateUrl: 'partials/main.html',
            controller: 'mainController'
        }).
        otherwise({
            redirectTo: '/'
        })
}]);
