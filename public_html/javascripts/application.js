'use strict';
var nwmApplication = angular.module('notewithme', ['ngRoute','ng-contentful', 'hc.marked']);

nwmApplication.config(['$routeProvider', '$compileProvider','contentfulClientProvider','markedProvider','$locationProvider', function ($routeProvider, $compileProvider,contentfulClientProvider, markedProvider, $locationProvider) {
    markedProvider.setOptions({gfm: true})

    contentfulClientProvider.setSpaceId('52e2zlhwamdy');
    contentfulClientProvider.setAccessToken('a54892f18ee79d9de92bd2d4aaf1a690ebedf5de3a585ef21194ae4e565d8403');

    $locationProvider.hashPrefix('!');

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
