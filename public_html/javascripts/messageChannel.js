nwmApplication.directive('messagechannel', ['SocketIoService', '$timeout', function (SocketIoService, $timeout) {
    return {
        restrict: 'E',
        scope: '',
        controller: function ($scope,  $element) {
            SocketIoService.receive().messageChannel(messageChannel);
            function messageChannel(msg){
                $scope.messageChannel = msg;
                $element.find('.alert').addClass('in');
                $timeout(function(){
                    $element.find('.alert').removeClass('in');
                },3500);
                $scope.$apply();
            }
        },
        templateUrl: 'directives/messagechannel.html'
    }
}]);