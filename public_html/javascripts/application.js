'use strict';
var nwmApplication = angular.module('notewithme', ['ngRoute','djds4rce.angular-socialshare']);
nwmApplication.run(['$FB', function($FB){
    $FB.init('1777278692496422');
}]);
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
