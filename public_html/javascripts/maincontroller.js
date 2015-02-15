'use strict';
nwmApplication.controller('mainController', ['$scope', '$location', 'UserService', 'Utils', function ($scope, $location, UserService, Utils) {
    if(window.useAnalytics) {
        ga('send', 'event', 'User Path', 'Main Page', 'Load');
    }
    $scope.start = function (user) {
        UserService.user().name = user.name;
        UserService.user().randomString = Utils.randomString() + Utils.randomString();
        UserService.user().room = user.room;
        trackStart();
        $location.path('/r/' + UserService.user().randomString + '/' + user.room);
    }
    function trackStart() {
        if(window.useAnalytics) {
            ga('send', 'event', 'User Path', 'Modal', 'Start');
        }
    }

    $scope.trackModal = function () {
        if(window.useAnalytics) {
            ga('send', 'event', 'User Path', 'Main Page', 'Open Modal');
        }
    }
}]);