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

    $scope.start = function(user){
        UserService.user().name = user.name;
        UserService.user().room = $routeParams.roomName;
        modalWith('hide');
        FabricService.start($scope);
    }

    if(UserService.isEmpty()){
        modalWith('show');
    }else{
        FabricService.start($scope);
    }

    function modalWith(action) {
        var element = angular.element('#startModal');
        $compile(element)($scope);
        element.modal(action);
    }
}]);