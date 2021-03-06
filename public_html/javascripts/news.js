nwmApplication.directive('news', ['ContentTypeList','contentfulClient',function (ContentTypeList, contentfulClient) {
    return {
        restrict: 'E',
        scope: {
            limit: '='
        },
        link:function($scope, element){
            if($scope.limit == 0){
                element.find('.readmore').remove();
            }
            $scope.isLastElement = function(last){
                return last && $scope.limit == 0 ? 'hide': '';
            }

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
        templateUrl: 'directives/news.html'
    }
}]);