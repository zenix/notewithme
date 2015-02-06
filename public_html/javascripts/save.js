nwmApplication.directive('save', ['CanvasService', '$timeout', function (CanvasService, $timeout) {
    return {
        restrict: 'E',
        scope: '',
        controller: function ($scope) {
            $scope.save = function () {
                CanvasService.saveCanvas();
            }
        },
        templateUrl: 'directives/save.html'
    }
}]);