angular.module('productbacklog', ['resources.productBacklog','services.crud'])

.config(['crudRouteProvider', function(crudRouteProvider){

        var projectId = ['$route', function($route){
            return $route.current.params.projectId;
        }];

        crudRouteProvider.routesFor('ProductBacklog','projects','projects/:projectId')
            .whenList({
                projectId : projectId,
                backlog : ['$route','ProductBacklog',function($route, ProductBacklog){
                    return ProductBacklog.forProject($route.current.params.projectId);
                }]
            })

            .whenNew({  //create a new product backlog item route
                projectId : projectId,
                backlogItem : ['$route', 'ProductBacklog',function($route,ProductBacklog){
                    return new ProductBacklog({projectId : $route.current.params.projectId});
                }]
            })

            .whenEdit({
                projectId : projectId,
                backlogItem : ['$route','ProductBacklog', function($route, ProductBacklog){
                    return ProductBacklog.getById($route.current.params.itemId); //这里是itemId,弄清楚
                }]
            });

    }])

.controller('ProductBacklogListCtrl',['$scope','crudListMethods','projectId','backlog', function($scope,crudListMethods,projectsId, backlog){
        $scope.backlog = backlog;
        angular.extend($scope, crudListMethods('/projects/'+projectsId+'/productbacklog'));
    }])

.controller('ProductBacklogEditCtrl',['$scope','$location','projectId','backlogItem',function($scope,$location,projectId,backlogItem){

        $scope.backlogItem = backlogItem;

        $scope.onSave = function(){
            $location.path('/projects/'+projectId+'/productbacklog');
        };

        $scope.onError = function(){
            $scope.updateError = true;
        };

    }]);