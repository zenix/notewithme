nwmApplication.directive('help', ['CanvasService', function (CanvasService) {
    return {
        restrict: 'E',
        scope: '',
        link:function($scope){
          $scope.canvasTools = CanvasService.canvasTools();
        },
        controller: function ($scope) {
            $scope.help = function () {
                if (window.useAnalytics) {
                    ga('send', 'event', 'User Path', 'Link', 'Help');
                }
            }
        },
        templateUrl: 'directives/help.html'
    }
}]);