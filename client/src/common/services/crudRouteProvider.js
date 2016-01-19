(function(){

    function crudRouteProvider($routeProvider){

        //this $get noop is because at the moment in angularjs "providers" must provide something
        //via a $get method
        //when angularjs has "provide helpers" then this will go away
        this.$get = angular.noop;

        //in any case the point is that this function is the key part of this "provider helper"
        //we use it to create routes for CRUD operations.we give it some basic information about the resource and the urls
        // then it returns our own special routesProvider
        this.routesFor = function( resourceName, urlPrefix, routePrefix ){

            var baseUrl = resourceName.toLowerCase();
            var baseRoute = '/' + resourceName.toLowerCase();
            routePrefix = routePrefix || urlPrefix;

            //prepend the urlPrefix if it is available
            if( angular.isString(urlPrefix) && urlPrefix !== "" ){
                baseUrl = urlPrefix + "/" + baseUrl;
            }

            //prepend the routePrefix if it is provided
            if( routePrefix !== null &&  routePrefix !== undefined && routePrefix !== ""){
                baseRoute = '/' + routePrefix + baseRoute;
            }

            //create the template url for a route to our resource that does the specified operation
            var templateUrl = function(operation){
                return baseUrl + '/' + resourceName.toLowerCase() + '-' + operation + '.tpl.html';
            };

            //create the controller name for a route to our resource that does the specified operation
            var controllerName = function(operation){
                return resourceName + operation + 'Ctrl';
            };

            //this is the object that our 'RouteFor() function returns. it decorate $routeProvider
            //delegate the when() and otherwise() functions but also exposing some new functions for
            //creating new crud routes

            var routeBuilder = {

                //create a route that will showing a list of items
                whenList : function(resolveFns){
                    routeBuilder.when(baseRoute,{
                        templateUrl : templateUrl('List'),
                        controller : controllerName('List'),
                        resolve : resolveFns
                    });
                    return routeBuilder;
                },
                //creating a route that will handle creating a new item
                whenNew : function(resolveFns){
                    routeBuilder.when(baseRoute+'/new',{
                        templateUrl : templateUrl('Edit'),
                        controller : controllerName('Edit'),
                        resolve : resolveFns
                    });
                    return routeBuilder;
                },
                //creating a route that will handle editing an existing item
                whenEdit : function(resolveFns){
                    routeBuilder.when(baseRoute +'/:itemId',{
                        template : templateUrl('Edit'),
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

    crudRouteProvider.$injector = ['$routeProvider'];

    angular.module('services.crudRouteProvider',['ngRoute']).provider('crudRoute',crudRouteProvider);


})();