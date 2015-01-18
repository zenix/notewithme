nwmApplication.directive('downloadasimage', ['CanvasService', '$timeout', function (CanvasService, $timeout) {
    return {
        restrict: 'E',
        scope: '',
        controller: function ($scope) {
            $scope.downloadAsImage = function () {
                var element = angular.element($('.downloadLink'));
                element.attr({
                    href: CanvasService.getCanvasAsBase64({format: 'jpeg', quality: 1.0}),
                    target: '_self',
                    download: 'notewithme.jpg'
                })[0].click();

            }
        },
        templateUrl: 'directives/downloadasimage.html'
    }
}]);