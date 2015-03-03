nwmApplication.directive('giveitatry', ['UserService','Utils','$location', function (UserService,Utils,$location) {
    return {
        restrict: 'E',
        scope: {},
        link: function ($scope) {
        },
        controller: function ($scope) {
            $scope.start = function (user) {
                UserService.user().name = user.name;
                UserService.user().randomString = Utils.randomString() + Utils.randomString();
                UserService.user().room = user.room;
                trackStart();
                $location.path('/r/' + UserService.user().randomString + '/' + user.room);
            }
            function trackStart() {
                if (window.useAnalytics) {
                    ga('send', 'event', 'User Path', 'Modal', 'Start');
                }
            }

            $scope.trackModal = function () {
                if (window.useAnalytics) {
                    ga('send', 'event', 'User Path', 'Main Page', 'Open Modal');
                }
            }
        },
        templateUrl: 'directives/giveitatry.html'
    }
}]);