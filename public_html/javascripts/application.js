'use strict';
var nwmApplication = angular.module('notewithme', ['ngRoute','djds4rce.angular-socialshare','ng-contentful', 'hc.marked']);
nwmApplication.run(['$FB', function($FB){
    $FB.init('1777278692496422');
}]);
nwmApplication.config(['$routeProvider', '$compileProvider','contentfulClientProvider','markedProvider', function ($routeProvider, $compileProvider,contentfulClientProvider, markedProvider) {
    markedProvider.setOptions({gfm: true})

    contentfulClientProvider.setSpaceId('52e2zlhwamdy');
    contentfulClientProvider.setAccessToken('a54892f18ee79d9de92bd2d4aaf1a690ebedf5de3a585ef21194ae4e565d8403');

    $compileProvider.aHrefSanitizationWhitelist(/^data:image\//);
    $routeProvider.
        when('/r/:randomString/:room', {
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
