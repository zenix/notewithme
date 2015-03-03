nwmApplication.directive('navbar', [function () {
    return {
        restrict: 'E',
        scope: {
            limit: '='
        },
        link:function($scope){
        },
        controller: function ($scope) {
        },
        templateUrl: 'directives/navbar.html'
    }
}]);