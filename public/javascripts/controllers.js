'use strict';

var noteWithMeControllers = angular.module('noteWithMeControllers', []);

noteWithMeControllers.controller('mainController', ['$scope','$location','UserService', function($scope, $location,UserService){
    $scope.start = function(user){
        UserService.user().name = user.name;
        UserService.user().room = user.room;
        $location.path('/room/'+user.room);
    }
}]);

noteWithMeControllers.controller('roomController', ['$scope', '$routeParams', '$window', 'SocketIoService','UserService','FabricService', function($scope, $routeParams, $window, SocketIoService, UserService,FabricService){

    $scope.start = function(user){
        UserService.user().name = user.name;
        UserService.user().room = $routeParams.roomName;
        angular.element('#startModal').clone().modal('close');
        FabricService.start($scope);
    }

    if(UserService.isEmpty()){
        angular.element('#startModal').clone().modal('show');
    }else{
        FabricService.start($scope);
    }
}]);