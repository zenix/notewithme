
var notewithmeDirectives = angular.module('notewithmeDirectives', []);

notewithmeDirectives.directive('modal', function () {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            show: '@',
            modalsubmit :'=ngModel'
        },
        replace: true,
        templateUrl:  'directives/modal.html',
        link: function(scope, element, attributes){
            if(scope.show === 'true') {
                element.modal('show');
            }
        },
        controller: function($scope, $element){
            $scope.submit = function(content){
                $scope.modalsubmit = content;
                $element.modal('hide');
            }
        }
    };
});

notewithmeDirectives.directive('buttonsRadio', [ function () {
    return {
        restrict: 'E',
        scope: { model: '=', options:'='},
        controller: function($scope){
            $scope.activate = function(option){
                $scope.model = option;
            };
        },
        templateUrl: 'directives/toggle.html'
    }
}]);