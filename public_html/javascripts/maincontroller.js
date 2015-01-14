'use strict';

nwmApplication.controller('mainController', ['$scope','$location','UserService', function($scope, $location,UserService){
    $scope.start = function(user){
        UserService.user().name = user.name;
        UserService.user().room = user.room;
        $location.path('/room/'+user.room);
    }

    angular.element('.mainContent').html('This is an early alpha version of notewithme.com. This service is meant for collaboration in meetings/meet-ups. Try it out!');
    $scope.shareClick = function(){
        angular.element('.mainContent').html('Copy paste link from address bar and send it to co-workers');
    }

    $scope.collaborateClick = function(){
           angular.element('.mainContent').html('Start making notes and draw. Your fellow collaborators see results instantly.');
       }
}]);