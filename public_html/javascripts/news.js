nwmApplication.directive('news', ['ContentTypeList','contentfulClient',function (ContentTypeList, contentfulClient) {
    return {
        restrict: 'E',
        scope: '',
        link:function($scope){

        },
        controller: function ($scope) {
            ContentTypeList.getContentType('3nPYDRJT0cCQkEi42OC4qo');
            contentfulClient.entries().then(function(entries){
                $scope.entries = entries;
            });
        },
        templateUrl: 'directives/news.html'
    }
}]);