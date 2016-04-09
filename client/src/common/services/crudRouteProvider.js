(function(){

    function crudRouteProvider($routeProvider){

        //angularjs的provides必须要提供一些东西
        this.$get = angular.noop;

        //函数是定义服务的主要方式
        //用这个服务创造crud操作的路由.需要给定关于url和route的基本信息
        this.routesFor = function( resourceName, urlPrefix, routePrefix ){

            var baseUrl = resourceName.toLowerCase();
            var baseRoute = '/' + resourceName.toLowerCase();
            routePrefix = routePrefix || urlPrefix;

            if( angular.isString(urlPrefix) && urlPrefix !== "" ){
                baseUrl = urlPrefix + "/" + baseUrl;
            }

            if( routePrefix !== null &&  routePrefix !== undefined && routePrefix !== ""){
                baseRoute = '/' + routePrefix + baseRoute;
            }

            var templateUrl = function(operation){ //返回模板文件的名字
                return baseUrl + '/' + resourceName.toLowerCase() + '-' + operation.toLowerCase() + '.tpl.html';
            };

            var controllerName = function(operation){  //返回控制器的名字
                return resourceName + operation + 'Ctrl';
            };

            var routeBuilder = {

                //创建一个路由用于list items
                whenList : function(resolveFns){
                    routeBuilder.when(baseRoute,{
                        templateUrl : templateUrl('List'),
                        controller : controllerName('List'),
                        resolve : resolveFns
                    });
                    return routeBuilder;
                },
                //创建一个路由来创建item
                whenNew : function(resolveFns){
                    routeBuilder.when(baseRoute+'/new',{
                        templateUrl : templateUrl('Edit'),
                        controller : controllerName('Edit'),
                        resolve : resolveFns
                    });
                    return routeBuilder;
                },
                //创建一个路由来编辑已经存在的item
                whenEdit : function(resolveFns){
                    routeBuilder.when(baseRoute +'/:itemId',{
                        templateUrl : templateUrl('Edit'),  //少写了url这几个字
                        controller : controllerName('Edit'),
                        resolve : resolveFns
                    });
                    return routeBuilder;
                },
                when : function(path,route){
                    $routeProvider.when(path,route);
                    return routeBuilder;
                },
                otherwise : function(params){
                    $routeProvider.otherwise(params);
                    return routeBuilder;
                },
                $routeProvider : $routeProvider
            };

            return routeBuilder;

        };

    }

    crudRouteProvider.$injector = ['$routeProvider'];  //通过$injector注入依赖的服务

    angular.module('services.crudRouteProvider',['ngRoute']).provider('crudRoute',crudRouteProvider);  //注册模块


})();