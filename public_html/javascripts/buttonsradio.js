nwmApplication.directive('buttonsRadio', ['CanvasService', function (CanvasService) {
    return {
        restrict: 'E',
        scope: {model: '=', options: '=', glyphiconicon: '@'},
        controller: function ($scope) {
            $scope.activate = function (option) {
                $scope.model = option;
                CanvasService.setActiveCanvasTool(option.name);
                CanvasService.calculateOffset();
            };
        },
        templateUrl: 'directives/toggle.html'
    }
}]);