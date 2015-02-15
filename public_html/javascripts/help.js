nwmApplication.directive('help', function () {
    return {
        restrict: 'E',
        scope: '',
        controller: function ($scope) {
            $scope.help = function () {
                if (window.useAnalytics) {
                    ga('send', 'event', 'User Path', 'Link', 'Help');
                }
            }
        },
        templateUrl: 'directives/help.html'
    }
});