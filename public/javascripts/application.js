'use strict';

var application = angular.module('notewithme', ['ngRoute', 'notewithmeServices', 'noteWithMeControllers', 'notewithmeDirectives']);

application.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/room', {
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
