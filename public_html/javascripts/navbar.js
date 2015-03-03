nwmApplication.directive('navbar', [function () {
    return {
        restrict: 'E',
        scope: {
            linkclass: '@'
        },
        link:function($scope,element){
            element.find('.' + $scope.linkclass).addClass('active');
        },
        controller: function ($scope) {
        },
        templateUrl: 'directives/navbar.html'
    }
}]);