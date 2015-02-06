nwmApplication.directive('messagechannel', ['SocketIoService', '$timeout', function (SocketIoService, $timeout) {
    return {
        restrict: 'E',
        scope: '',
        controller: function ($scope,  $element) {
            SocketIoService.messageChannel(messageChannel);
            function messageChannel(msg){
                $scope.messageChannel = msg;
                $element.find('.alert').addClass('in');
                $timeout(function(){
                    $element.find('.alert').removeClass('in');
                },4000);
                $scope.$apply();
            }
        },
        templateUrl: 'directives/messagechannel.html'
    }
}]);