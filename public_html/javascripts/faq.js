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
                content_type: '4EUsdXzsc0A2MWy8SkgCKE',
                limit: $scope.limit
            };
            contentfulClient.entries(query).then(function(entries){
                $scope.entries = entries;
            });
        },
        templateUrl: 'directives/faq.html'
    }
}]);