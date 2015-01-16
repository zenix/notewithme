'use strict';
var nwmApplication = angular.module('notewithme', ['ngRoute']);
nwmApplication.config(['$routeProvider', function ($routeProvider) {
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
