'use strict';
var nwmApplication = angular.module('notewithme', ['ngRoute','djds4rce.angular-socialshare']);
nwmApplication.run(['$FB', function($FB){
    $FB.init('1777278692496422');
}]);
nwmApplication.config(['$routeProvider', '$compileProvider', function ($routeProvider, $compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^data:image\//);
    $routeProvider.
        when('/r/:randomString/:title', {
            templateUrl: 'partials/canvas.html',
            controller: 'canvasController'
        }).
        when('/', {
            templateUrl: 'partials/main.html',
            controller: 'mainController'
        }).
        otherwise({
            redirectTo: '/'
        })
}]);
