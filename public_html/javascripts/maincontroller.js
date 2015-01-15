'use strict';

nwmApplication.controller('mainController', ['$scope','$location','UserService', function($scope, $location,UserService){
    $scope.start = function(user){
        UserService.user().name = user.name;
        UserService.user().room = user.room;
        trackStart();
        $location.path('/room/'+user.room);
    }

    function trackStart(){
        ga('send', 'event', 'User Path', 'Modal', 'Start');
    }

    $scope.trackModal = function(){
        ga('send', 'event', 'User Path', 'Main Page', 'Open Modal');
    }
}]);