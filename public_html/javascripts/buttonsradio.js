nwmApplication.directive('buttonsRadio', [function () {
    return {
        restrict: 'E',
        scope: {model: '=', options: '=', glyphiconicon: '@'},
        controller: function ($scope) {
            $scope.activate = function (option) {
                $scope.model = option;
            };
        },
        templateUrl: 'directives/toggle.html'
    }
}]);