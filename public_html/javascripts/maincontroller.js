'use strict';
nwmApplication.controller('mainController', ['$scope', '$location', 'UserService', 'Utils', function ($scope, $location, UserService, Utils) {
    if(window.useAnalytics) {
        ga('send', 'event', 'User Path', 'Main Page', 'Load');
    }
}]);