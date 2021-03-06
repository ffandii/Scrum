//面包屑导航

angular.module('services.breadcrumbs',[])

    .factory('breadcrumbs',['$rootScope','$location',function($rootScope,$location){

        var breadcrumbs = [];
        var breadcrumbsService = {};

        //路由变化时更新面包屑导航

        $rootScope.$on('$routeChangeSuccess',function( event, current ){

            var pathElements = $location.path().split('/'), result = [], i;  //path() /admin/users/list
            var breadcrumbPath = function( index ){
                return '/' + pathElements.slice(0,index+1).join('/');
            };

            pathElements.shift();
            for( i = 0; i < pathElements.length; i++ ){
                result.push({name : pathElements[i], path: breadcrumbPath(i)});
            }

            breadcrumbs = result;

        });

        breadcrumbsService.getAll = function(){
            return breadcrumbs;
        };

        breadcrumbsService.getFirst = function(){
            return breadcrumbs[0] || {};
        };

        return breadcrumbsService;

    }]);