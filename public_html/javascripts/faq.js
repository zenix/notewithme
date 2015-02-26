nwmApplication.directive('faq', ['ContentTypeList','contentfulClient',function (ContentTypeList, contentfulClient) {
    return {
        restrict: 'E',
        scope: {
            limit: '='
        },
        link:function($scope){

        },
        controller: function ($scope) {
            var query = {
                content_type: '3nPYDRJT0cCQkEi42OC4qo',
                order: '-sys.createdAt',
                limit: $scope.limit
            };
            contentfulClient.entries(query).then(function(entries){
                $scope.entries = entries;
            });
        },
        templateUrl: 'directives/faq.html'
    }
}]);