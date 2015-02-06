'use strict';
nwmApplication.controller('mainController', ['$scope', '$location', 'UserService', 'Utils', function ($scope, $location, UserService, Utils) {
    ga('send', 'event', 'User Path', 'Main Page', 'Load');
    $scope.start = function (user) {
        UserService.user().name = user.name;
        UserService.user().randomString = Utils.randomString() + Utils.randomString();
        UserService.user().topic = user.room;
        trackStart();
        $location.path('/r/' + UserService.user().randomString + '/' + user.room);
    }
    function trackStart() {
        ga('send', 'event', 'User Path', 'Modal', 'Start');
    }

    $scope.trackModal = function () {
        ga('send', 'event', 'User Path', 'Main Page', 'Open Modal');
    }
}]);