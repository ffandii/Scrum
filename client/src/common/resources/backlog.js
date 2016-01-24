angular.module('resources.productBacklog', ['mongolabResource']);  //待办列表

angular.module('resources.productBacklog').factory('ProductBacklog', ['mongolabResource', function(mongolabResource){

    var ProductBacklog = mongolabResource('productBacklog');  //产品待办列表

    ProductBacklog.forProject = function(projectId){
        return ProductBacklog.query({ projectId : projectId });
    };

    return ProductBacklog;

}]);