nwmApplication.directive('faq', ['ContentTypeList','contentfulClient',function (ContentTypeList, contentfulClient) {
    return {
        restrict: 'E',
        scope: {
            limit: '='
        },
        link:function($scope, element, attrs){
            if($scope.limit == 0){
               element.find('.readmore').remove();
            }

            $scope.isLastElement = function(last){
               return last && $scope.limit == 0 ? 'hide': '';
            }
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