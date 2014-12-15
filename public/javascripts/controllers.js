'use strict';

var noteWithMeControllers = angular.module('noteWithMeControllers', []);

noteWithMeControllers.controller('mainController', ['$scope','$location','UserService', function($scope, $location,UserService){
    $scope.start = function(user){
        UserService.user().name = user.name;
        UserService.user().room = user.room;
        $location.path('/room/'+user.room);
    }
}]);

noteWithMeControllers.controller('roomController', ['$scope', '$location', '$routeParams', '$compile', '$window', 'SocketIoService','UserService','FabricService', function($scope, $location, $routeParams, $compile, $window, SocketIoService, UserService,FabricService){

    $scope.$watch('modalsubmit', function(newValue, oldValue){
        if(newValue){
            UserService.user().name = newValue.name;
            UserService.user().room = $routeParams.roomName;
            FabricService.start($scope);
        }
    })

    if(UserService.isEmpty()){
        $scope.modal = {};
        $scope.modal.show = true;
        $scope.modal.title = 'Please fill name and you\'re free to go.';
    }else{
        FabricService.start($scope);
    }
}]);