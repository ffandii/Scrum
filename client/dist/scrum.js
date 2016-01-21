/* scrum - v 0.0.1 - 2016-01-21 
https://github.com/ffandii/Scrum 
 * Copyright (c) 2016 ffandii 
*/
 angular.module('admin',['admin-projects']);
angular.module('admin-projects',[
    'resources.projects',
    'resources.users',
    'services.crud',
    'security.authorization'
])
                                                   //config时后缀加上provider
.config(['crudRouteProvider','securityAuthorizationProvider',function(crudRouteProvider, securityAuthorization){

        var getAllUsers = ['Projects','Users','$route',function(Projects,Users,$route){
           return Users.all();
        }];

        crudRouteProvider.routesFor('Projects','admin')
            .whenList({
                projects : ['Projects', function(Projects){ return Projects.all(); }],
                adminUser : securityAuthorization.requireAdminUser
            })
            .whenNew({
                project : ['Projects', function(Projects){ return new Projects(); }],
                users : getAllUsers,
                adminUser : securityAuthorization.requireAdminUser
            })
            .whenEdit({
                project : ['Projects','Users','$route',function(Projects,Users,$route){ return Projects.getById($route.current.params.itemId); }],
                users : getAllUsers,
                adminUser : securityAuthorization.requireAdminUser
            });

    }])

.controller('ProjectsListCtrl', ['$scope','crudListMethods','projects',function($scope,crudListMethods,projects){

        $scope.projects = projects;
        angular.extend($scope,crudListMethods('/admin/projects'));

    }])

.controller('ProjectsEditCtrl',['$scope','$location','i18nNotifications','users', 'project', function($scope,$location,i18nNotifications,users,project){

        $scope.project = project;
        $scope.users = users;
        $scope.onSave = function(project){
            i18nNotifications.pushForNextRoute('crud.project.save.success','success',{ id : project.$id() });
            $location.path('/admin/projects');
        };

        $scope.onError = function(project){
            i18nNotifications.pushForCurrentRoute('crud.project.save.error','error');
        };

    }])

.controller('TeamMembersController',['$scope',function($scope){

        $scope.project.teamMembers = $scope.project.teamMembers || [];
        $scope.usersLookup = {};
        angular.forEach($scope.users, function(value, key){
            $scope.usersLookup[value.$id()] = value;
        });

        $scope.productOwnerCandidates = function(){
            return $scope.users.filter(function(user){
                return $scope.usersLookup[user.$id()] && $scope.project.canActAsProductOwner(user.$id());
            });
        };

        $scope.scrumMasterCandidates = function(){
            return $scope.users.filter(function(user){
                return $scope.usersLookup[user.$id()] && $scope.project.canActAsScrumMaster(user.$id());
            });
        };

        $scope.teamMemberCandidates = function(){
            return $scope.users.filter(function(user){
                return $scope.usersLookup[user.$id()] && $scope.project.canActAsDevTeamMember(user.$id()) && !$scope.project.isDevTeamMember(user.$id());
            });
        };

        $scope.selTeamMember = undefined;
        $scope.addTeamMember = function(){
            if($scope.selTeamMember){
                $scope.project.teamMembers.push($scope.selTeamMember);
                $scope.selTeamMember = undefined;
            }
        };

        $scope.removeTeamMember = function(teamMember){
            var idx = $scope.project.teamMembers.indexOf(teamMember);
            if(idx >= 0){
                $scope.project.teamMembers.splice(idx,1);
            }
            if($scope.selTeamMember === teamMember){
                $scope.selTeamMember = undefined;
            }
        };

    }]);


/**
 * Created by Administrator on 2016/1/3 0003.
 */

angular.module('app',[

    'ngRoute',
    'projectsInfo',
    'admin',
    'services.breadcrumbs',
    'services.i18nNotifications',
    'services.localizedMessages',
    'services.httpRequestTracker',
    'security',
    'directives.crud',
    'templates.app',
    'templates.common'

]);

angular.module('app').constant('MONGOLAB_CONFIG',{  //connect ongodb config
    baseUrl: '/databases/',
    dbName: 'ffandii'
});

//TODO remove those messages to a separate module
angular.module('app').constant('I18N.MESSAGES',{

    'errors.route.changeError' : '路由更改错误',
    'crud.user.save.success' : "用户 '{{id}}' 被成功保存了。",
    'crud.user.remove.success' : "用户 '{{id}}' 被成功删除了。",
    'crud.user.save.error' : "保存用户 '{{id}}' 时出现了错误...",
    'crud.user.remove.error' : "删除用户 '{{id}}' 时出现了错误...",
    'crud.project.save.success' : "项目 '{{id}}' 被成功保存了。",
    'crud.project.remove.success' : "项目 '{{id}}' 被成功删除了。",
    'crud.project.save.error' : "保存项目 '{{id}}' 时出现了错误...",
    'login.reason.notAuthorized' : "你没有必要的访问权限。你想作为其他人登录吗？",
    'login.reason.notAuthenticated' : "你必须先登录才能访问这部分内容。",
    'login.error.invalidCredentials' : "登录失败。请检查您的信息，然后重试。",
    'login.error.serverError' : "服务端认证错误：'{{exception}}'。"

});

angular.module('app').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                                        //html5模式 http://locahost/mypath..
    $locationProvider.html5Mode(true);
                                        //hashbang模式 http://locahost#/mypath...
    $routeProvider.otherwise({redirect : '/projectsInfo'});  //路由不匹配时重定向到projectsinfo
}]);

angular.module('app').run(['security',function(security){

    //get the current user when the application starts
    //in case they are still logged in from a previous session
    security.requestCurrentUser();

}]);

angular.module('app').controller('AppCtrl', ['$scope','i18nNotifications','localizedMessages',function($scope, i18nNotifications, localizedMessages){
    $scope.notifications = i18nNotifications;

    $scope.removeNotification = function(notification){
        i18nNotifications.remove(notification);
    };

    $scope.$on('$routeChangeError',function(event, current, previous, rejection){
        i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection : rejection});
    });

}]);

angular.module('app').controller('HeaderCtrl', ['$scope','$location', '$route', 'security', 'breadcrumbs', 'httpRequestTracker',
    function ($scope, $route, $location, security, breadcrumbs, httpRequestTracker) {

        $scope.location = $location;
        $scope.breadcrumbs = breadcrumbs;

        $scope.isAuthenticated = security.isAuthenticated;
        $scope.isAdmin = security.isAdmin;

        $scope.home = function(){

            if( security.isAuthenticated() ){
                $location.path('/dashboard');
            } else {
                $location.path('/projectsInfo');
            }

        };

        $scope.isNavBarActive = function(navBarPath){
            return navBarPath === breadcrumbs.getFirst().name;
        };

        $scope.hasPendingRequests = function() {
            return httpRequestTracker.hasPendingRequests();
        };

        $scope.isAdminOpen = false;

    }]);
angular.module('projectsInfo', [])
    .config(['$routeProvider',function($routeProvider){

        $routeProvider.when('/projectsInfo',{

            templateUrl : 'projectsInfo/list.tpl.html',
            controller : "ProjectsInfoCtrl"

            //projectsInfo记录各projects的信息

        });

    }]);

angular.module('projectsInfo').controller('ProjectsInfoCtrl',['$scope',function($scope){

}]);
angular.module('directives.crud',['directives.crud.buttons','directives.crud.edit']); //crud指令集
angular.module('directives.crud.buttons', []);

angular.module('crudButtons',function(){

    return {
        restrict : 'E',
        replace : true,
        template :
            '<div>' +
                ' <button type="button" class="btn btn-primary save" ng-disabled="!canSave()" ng-click="save()">保存</button>  ' +
                ' <button type="button" class="btn btn-warning revert" ng-click="revertChanges()" ng-disabled="!canRevert()">撤销更改</button> ' +
                ' <button type="button" class="btn btn-danger remove" ng-click="remove()" ng-show="canRemove()">删除</button> ' +
            '</div>'
    };

});
angular.module('directives.crud.edit', [])

//apply this directive to an element at or below a form that will manage crud operations on a resource
//the resource must expose the following instance methods: $saveOrUpdate() $id() and $remove()

.directive('crudEdit', ['$parse', function($parse){

        return {

            scope : true,
            require : "^form",
            //this directive can only appear as an attribute
            link : function(scope,element,attrs,form){

                var resourceGetter = $parse(attrs.crudEdit);
                var resourceSetter = resourceGetter.assign;
                //store the object for easy access
                var resource = resourceGetter(scope);
                var original = angular.copy(resource);

                var checkResourceMethod = function(methodName){
                    if(!angular.isFunction(resource[methodName])){
                        throw new Error('crudEdit directive: the resource must expose the '+methodName+'() instance method');
                    }
                };

                checkResourceMethod('$saveOrUpdate');
                checkResourceMethod('$id');
                checkResourceMethod('$remove');

                //该功能可以帮助我们从指令属性中提取命令函数
                var makeFn = function(attrName){
                    var fn = scope.$eval(attrs[attrName]);
                    if(!angular.isFunction(fn)){
                        throw new Error('crudEdit directive: the attribute '+attrName+" must evaluate to a function");
                    }
                    return fn;
                };

                //set up callbacks with fallback
                var userOnSave = attrs.onSave?makeFn('onSave'):(scope.onSave||angular.noop);
                var onSave = function(result, status, headers, config){
                    original = result;
                    userOnSave(result, status, headers, config);
                };

                var onRemove = attrs.onRemove?makeFn('onRemove'):(scope.onRemove || onSave);
                var onError = attrs.onError?makeFn('onError'):(scope.onError||angular.noop);

                scope.save = function(){
                    resource.$saveOrUpdate(onSave,onSave,onError,onError);
                };

                scope.revertChanges = function(){
                    resource = angular.copy(original);
                    resourceSetter(scope, resource);
                    form.$setPristine();
                };

                scope.remove = function(){
                    if(resource.$id()){
                        resource.$remove(onRemove, onError);
                    } else {
                        onRemove();
                    }
                };

                scope.canSave = function(){
                    return form.$valid && !angular.equals(resource, original);
                };

                scope.canRevert = function(){
                    return !angular.equals(resource, original);
                };

                scope.canRemove = function(){
                    return resource.$id();
                };

                scope.getCssClasses = function(fieldName){
                    var ngModelController = form[fieldName];
                    return {
                        error : ngModelController.$invalid && !angular.equals(resource, original),
                        success : ngModelController.$valid && !angular.equals(resource, original)
                    };
                };

                scope.showError = function(fieldName, error) {
                    return form[fieldName].$error[error];
                };
            }

        };

    }]);
angular.module('resources.projects', ['mongolabResource']);

angular.module('resources.projects').factory('Projects', ['mongolabResource',function(mongolabResource){

    var projects = mongolabResource('projects');  //productsOwner > scrumMater > devMember

    projects.forUser = function(userId, successcb, errorcb){
        return projects.query({},successcb,errorcb);
    };

    projects.prototype.isProductOwner = function(userId){
        return this.productOwner === userId;
    };

    projects.prototype.isScrumMaster = function(userId){
        return this.scrumMaster === userId;
    };

    projects.prototype.isDevTeamMember = function( userId ){
        return this.teamMembers.indexOf(userId) >= 0;
    };

    projects.prototype.canActAsProductOwner = function( userId ){
        return ! this.isScrumMaster(userId) && ! this.isDevTeamMember(userId);
    };

    projects.prototype.canActAsScrumMaster = function( userId ){
        return ! this.isProductOwner(userId);
    };

    projects.prototype.canActAsDevTeamMember = function( userId ){
        return ! this.isProductOwner(userId);
    };

    projects.prototype.getRoles = function( userId ){  //projects中获取当前user的角色
        var roles = [];
        if( this.isProductOwner( userId ) ){
            roles.push('PO');
        } else {
            if( this.isScrumMaster(userId) ){
                roles.push('SM');
            }
            if( this.isDevTeamMember(userId)){
                roles.push('DEV');
            }
        }
        return roles;
    };

    return projects;

}]);
angular.module('resources.users',['mongolabResource']);

angular.module('resources.users').factory('Users',['mongolabResource', function(mongolabResource){

    var userResource = mongolabResource('users');

    userResource.prototype.getFullName = function(){
        return this.lastName + " " + this.firstName + " ( "+this.email+ " )";
    };

    return userResource;

}]);
angular.module('security.authorization', ['security.service'])

//防止导航到安全受限路由，确保用户不能导航到安全受限路径

.provider('securityAuthorization', {

        requireAdminUser : ['securityAuthorization', function(securityAuthorization){
            return securityAuthorization.requireAdminUser();
        }],

        requireAuthenticatedUser : ['securityAuthorization', function(securityAuthorization){
            return securityAuthorization.requireAuthenticatedUser();
        }],

        $get : ['security', 'securityRetryQueue', function(security, queue){

            var service = {

                requireAuthenticatedUser : function(){
                    var promise = security.requestCurrentUser().then(function(userInfo){
                        if( !security.isAuthenticated() ){
                            return queue.pushRetryFn('unauthenticated-client', service.requireAuthenticatedUser);
                        }
                    });
                    return promise;
                },

                requireAdminUser : function(){

                    var promise = security.requestCurrentUser().then(function(userInfo){
                        if( !security.isAdmin() ){
                            return queue.pushRetryFn('unauthorized-client', service.requireAdminUser);
                        }
                    });

                    return promise;

                }

            };

            return service;

        }]

    });
angular.module('security',[
    'security.service',
    'security.interceptor',
    'security.login',
    'security.authorization'
]);
//注入$httpProvider服务的响应拦截器
angular.module('security.interceptor', ['security.retryQueue'])

//this http interceptor listens for authentication failures

    .factory('securityInterceptor',['$injector','securityRetryQueue',function($injector,queue){

        return function(promise){

            //intercept failed requests
            return promise.then(null, function( originalResponse ){

                if( originalResponse.status === 401 ){
                    promise = queue.pushRetryFn('unauthorized-server', function retryRequest(){
                        //we must use $inject to get the $http service to prevent circular dependency
                        return $injector.get('$http')(originalResponse.config);

                    });
                }

                return promise;

            });

        };

    }])

.config(['$httpProvider',function($httpProvider){

        $httpProvider.responseInterceptors.push('securityInterceptor');

    }]);


angular.module('security.login.form', ['services.localizedMessages'])

    .controller('LoginFormController', ['$scope', 'security', 'localizedMessages', function( $scope, security, localizedMessages ){

        //the modal for the form
        $scope.user = {};

        //any error message from failing to login
        $scope.authError = null;

        //the reason that we are being asked to login, for instance , because we tried to access something to which we are not authorized now
        $scope.authReason = null;
        if(security.getLoginReason()){
            $scope.authReason = ( security.isAuthenticated() ) ?
                localizedMessages.get( 'login.reason.notAuthorized' ) :  //没有必要的访问权限
                localizedMessages.get( 'login.reason.notAuthenticated' );  //没有登录
        }

        //attempt to authenticated the user specified in the form's model
        $scope.login = function(){

            $scope.authError = null;

            security.login($scope.user.email, $scope.user.password).then(function(loggedIn){
                if(!loggedIn){
                    //if we get here then the login failed due to bad credentials
                    $scope.authError = localizedMessages.get('login.error.invalidCredentials');
                }
                //if we get here then there was a problem with the login request to the server
            }, function(x){
                $scope.authError = localizedMessages.get('login.error.serverError', { exception : x });
            });


            $scope.clearForm = function(){
                $scope.user = {};
            };

            $scope.cancelLogin = function(){
                security.cancelLogin();
            };
        };

    }]);
angular.module('security.login', ['security.login.form', 'security.login.toolbar']);
angular.module('security.login.toolbar',[])

//the login toolToolbar directive is a reusable widget that can show login or logout button
//and information the current authenticated user

    .directive('loginToolbar', ['security', function(security){  //指令中提供的字段选项都是可选的

        var directive = {
            templateUrl : "security/login/toolbar.tpl.html",
            restrict : "E",
            replace : true,
            scope : true,  //继承自己的父作用域还是创建一个独立的作用域
            link : function( $scope, $element, $attrs, $controller ){
                $scope.isAuthenticated = security.isAuthenticated;
                $scope.login = security.showLogin;
                $scope.logout = security.logout;
                $scope.$watch(function(){
                    return security.currentUser;
                }, function(currentUser){
                    $scope.currentUser = currentUser;
                });
            }
        };

        return directive;

    }]);
angular.module('security.retryQueue', [])

//this is a generic retry queue for security failures. Each item is expected to expose to functions: retry and cancel
.factory('securityRetryQueue', ['$q', '$log', function($q, $log){

        var retryQueue = [];
        var service = {
            //the security service put its own handler in here
            onItemAddedCallbacks : [],

            hasMore : function(){
                return retryQueue.length > 0;
            },

            push : function( retryItem ) {
                retryQueue.push( retryItem );
                //call all the onItemAdded callbacks
                angular.forEach( service.onItemAddedCallbacks, function( cb ){
                    try {
                        cb( retryItem );
                    } catch( e ){
                        $log.error('securityRetryQueue.push(retryItem): callback threw an error: '+ e);
                    }
                });
            },

            pushRetryFn : function( reason, retryFn ){
                //the reason parameter is optional
                if( arguments.length === 1 ){
                    retryFn = reason;
                    reason = undefined;
                }

                //the deferred object that will be resolved or rejected by calling retry or cancel
                var deferred = $q.defer();
                var retryItem = {
                    reason : reason,
                    retry : function(){
                        //wrap the result of the retryFn into a promise if it is not already
                        $q.when(retryFn()).then(function(value){
                            //if it was successful, then resolve our deferred
                            deferred.resolve(value);
                        }, function(value){
                            //otherwise reject it
                            deferred.reject(value);
                        });
                    },
                    //give up our retrying and reject our deferred
                    cancel : function(){
                        deferred.reject();
                    }
                };
                service.push(retryItem);
                return deferred.promise;
            },

            retryReason : function(){
                return service.hasMore() && retryQueue[0].reason;
            },

            cancelAll : function(){
                while(service.hasMore()){
                    retryQueue.shift().cancel();
                }
            },

            retryAll : function(){
                while(service.hasMore()){
                    retryQueue.shift().retry();  //shift没有写成一个函数，导致错误
                }
            }

        };

        return service;

    }]);
//based loosely around work by Witold Szczerba
angular.module('security.service',[
    'security.retryQueue',  //keeps track of the failed requests that need to be retried once the user logs in
    'security.login',       //contains the login form templates and controller
    'ui.bootstrap.dialog'   //used to display the login form as a modal dialog
])

.factory('security', ['$http', '$q', '$location', 'securityRetryQueue', '$dialog', function( $http, $q, $location, queue, $dialog ){

        //redirect to the given url( default '/' )
        function redirect(url){
            url = url || '/';
            $location.path(url);
        }

        //login form dialog stuff
        var loginDialog = null;
        function openLoginDialog(){
            if( loginDialog ){
                throw new Error('Trying to open a dialog that is already open...');
            }
            loginDialog = $dialog.dialog();
            loginDialog.open('security/login/form.tpl.html', 'LoginFormController').then(onLoginDialogClose);
        }

        function closeLoginDialog(success){

            if( loginDialog ){
                loginDialog.close(success);
            }

        }

        function onLoginDialogClose(success){

            loginDialog = null;
            if(success){
                queue.retryAll();
            } else {
                queue.cancelAll();
                redirect();
            }

        }

        //register a handler for when an item is added to the retry queue
        queue.onItemAddedCallbacks.push(function(retryItem){
            if(queue.hasMore()){
                service.showLogin();
            }
        });

        var service = {

            getLoginReason : function(){
                return queue.retryReason();
            },

            showLogin : function(){
                openLoginDialog();
            },

            //attempt to authenticate a user by the given email and password
            login : function( email, password ){

                var request = $http.post('/login', { email : email, password : password });
                return request.then(function(response){
                    service.currentUser = response.data.user;
                    if(service.isAuthenticated()){
                        closeLoginDialog(true);
                    }
                    return service.isAuthenticated();
                });

            },

            //give up trying to login and clear the retry queue
            cancelLogin : function(){
                closeLoginDialog(false);
                redirect();
            },

            //logout the current user and redirect
            logout : function(redirectTo){
                $http.post('/logout').then(function(){
                    service.currentUser = null;
                    redirect(redirectTo);
                });
            },

            //ask the backend to see if a user is already authenticated -- this may be from a previous session
            requestCurrentUser : function(){
                if(service.isAuthenticated()){
                    return $q.when(service.currentUser);  //传值服务
                } else {
                    return $http.get('/current-user').then(function(response){  //这里把路由写错了
                        service.currentUser = response.data.user;
                        return service.currentUser;
                    });
                }
            },

            currentUser : null,

            isAuthenticated : function(){
                return !!service.currentUser;  //currentUser
            },

            isAdmin : function(){
                return !!(service.currentUser && service.currentUser.admin);
            }

        };

        return service;

    }]);
//面包屑导航

angular.module('services.breadcrumbs',[])

    .factory('breadcrumbs',['$rootScope','$location',function($rootScope,$location){

        var breadcrumbs = [];
        var breadcrumbsService = {};

        //we only want to update a breadcrumbs only when a route is actually changed
        //as $location.path will get updated immediately

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
angular.module('services.crud', ['services.crudRouteProvider']);

angular.module('services.crud').factory('crudEditMethods',function(){

    return function(itemName, item, formName, successcb, errorcb){

        var mixin = {};

        mixin[itemName] = item;
        mixin[itemName+'Copy'] = angular.copy(item);

        mixin.save=  function(){
            this[itemName].$saveOrUpdate(successcb, successcb, errorcb, errorcb);
        };

        mixin.canSave = function(){
            return this[formName].$valid && !angular.equals(this[itemName], this[itemName+'Copy']);
        };

        mixin.revertChanges = function(){
            this[itemName] = angular.copy(this[itemName+'Copy']);
        };

        mixin.canRevert = function(){
            return !angular.equals(this[itemName],this[itemName+'Copy']);
        };

        mixin.remove = function(){
            if(this[itemName].$id()){
                this[itemName].$remove(successcb, errorcb);
            } else {
                successcb();
            }
        };

        mixin.canRemove = function(){
            return item.$id();
        };

        mixin.getCssClasses = function(fieldName){
            var ngModelController = this[formName][fieldName];
            return {
                error : ngModelController.$invalid && ngModelController.$dirty,
                success : ngModelController.$valid && ngModelController.$dirty
            };
        };

        mixin.showError = function(fieldName, error) {
            return this[formName][fieldName].$error[error];
        };

        return mixin;

    };

});

angular.module('services.crud').factory('crudListMethods',['$location',function($location){

    return function(pathPrefix){

        var mixin = {};

        mixin['new'] = function(){
            $location.path(pathPrefix + '/new');
        };

        mixin['edit'] = function(itemId){
            $location.path(pathPrefix +'/'+itemId);
        };

        return mixin;

    };

}]);
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
                return baseUrl + '/' + resourceName.toLowerCase() + '-' + operation.toLowerCase() + '.tpl.html';
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
angular.module('services.httpRequestTracker', [])
.factory('httpRequestTracker', ['$http', function($http){

        var httpRequestTracker = {};
        httpRequestTracker.hasPendingRequests = function() {

          return $http.pendingRequests.length > 0;
            
        };

        return httpRequestTracker;

    }]);
angular.module('services.i18nNotifications',['services.notifications','services.localizedMessages']);

angular.module('services.i18nNotifications').factory('i18nNotifications',['localizedMessages', 'notifications', function(localizedMessages, notifications){

    var prepareNotifications = function( msgKey, type, interpolateParams, otherProperties ){
        return angular.extend({
            message : localizedMessages.get(msgKey, interpolateParams),
            type : type
        },otherProperties);
    };

    var i18nNotifications = {
        pushSticky : function(msgKey, type, interpolateParams, otherProperties){
            return notifications.pushSticky(prepareNotifications(msgKey, type, interpolateParams, otherProperties));
        },
        pushForCurrentRoute : function(msgKey, type, interpolateParams, otherProperties){
            return notifications.pushForCurrentRoute(prepareNotifications(msgKey, type, interpolateParams, otherProperties));
        },
        pushForNextRoute : function(msgKey, type, interpolateParams, otherProperties){
            return notifications.pushForNextRoute(prepareNotifications(msgKey, type, interpolateParams, otherProperties));
        },
        getCurrent : function(){
            return notifications.getCurrent();
        },
        remove : function(notification){
            return notifications.remove(notification);
        }
    };

    return i18nNotifications;

}]);
angular.module('services.localizedMessages', []).factory('localizedMessages', ['$interpolate', 'I18N.MESSAGES', function ($interpolate, i18nmessages) {

    var handleNotFound = function (msg, msgKey) {
        return msg || '?' + msgKey + '?';
    };

    return {
        get : function (msgKey, interpolateParams) {
            var msg =  i18nmessages[msgKey];
            if (msg) {
                return $interpolate(msg)(interpolateParams);
            } else {
                return handleNotFound(msg, msgKey);
            }
        }
    };
}]);
angular.module('services.notifications',[])
.factory('notifications',['$rootScope', function($rootScope){

        var notifications = {
            'STICKY' : [],
            'ROUTE_CURRENT' : [],
            'ROUTE_NEXT' : []
        };

        var notificationsService = {};

        var addNotification = function(notificationsArray, notificationObj){
            if(!angular.isObject(notificationObj)){
                throw new Error("only object can be added to the notification service");
            }

            notificationsArray.push(notificationObj);
            return notificationObj;
        };

        $rootScope.$on('$routeChangeSuccess', function(){
            notifications.ROUTE_CURRENT.length = 0;
            notifications.ROUTE_CURRENT = angular.copy(notifications.ROUTE_NEXT);
            notifications.ROUTE_NEXT.length = 0;
        });

        notificationsService.getCurrent = function(){
            return [].concat(notifications.STICKY,notifications.ROUTE_CURRENT);
        };

        notificationsService.pushSticky = function(notification){
            return addNotification(notifications.STICKY, notification);
        };

        notificationsService.pushForCurrentRoute = function(notification){
            return addNotification(notifications.ROUTE_CURRENT, notification);
        };

        notificationsService.putForNextRoute = function(notification){
            return addNotification(notifications.ROUTE_NEXT, notification);
        };

        notificationsService.remove = function(notification){
            angular.forEach(notifications, function(notificationsByType){
                var idx = notificationsByType.indexOf(notification);
                if( idx > -1 ){
                    notificationsByType.splice(idx, 1);
                }
            });
        };

        notificationsService.removeAll = function(notification){
            angular.forEach(notifications, function(notificationsByType){
                notificationsByType.length = 0;
            });
        };


        return notificationsService;

    }]);
angular.module('templates.app', ['admin/projects/projects-edit.tpl.html', 'admin/projects/projects-list.tpl.html', 'header.tpl.html', 'notifications.tpl.html', 'projectsInfo/list.tpl.html']);

angular.module("admin/projects/projects-edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("admin/projects/projects-edit.tpl.html",
    "<div class=\"well\"> <!-- projectsEditCtrl服务 -->\n" +
    "    <form name=\"form\" crud-edit=\"project\">\n" +
    "        <legend>项目</legend>\n" +
    "        <div class=\"row-fluid\">\n" +
    "            <div class=\"span6\">\n" +
    "                <label>名称</label>\n" +
    "                <input type=\"text\" name=\"name\" ng-model=\"project.name\" class=\"span10\" required autofocus/>\n" +
    "                <label>描述</label>\n" +
    "                <textarea rows=\"10\" cols=\"10\" ng-model=\"project.desc\" class=\"span10\"></textarea>\n" +
    "            </div>\n" +
    "            <div class=\"span6\" ng-controller=\"TeamMembersController\">\n" +
    "                <label>产品拥有者</label>\n" +
    "                <select class=\"span12\" ng-model=\"project.productOwner\"\n" +
    "                        ng-options=\"user.$id() as user.getFullName() for user in productOwnerCandidates()\" required>\n" +
    "                 <option value=\"\">-- 选择 --</option>\n" +
    "                </select>\n" +
    "                <label>Scrum管理者</label>\n" +
    "                <select class=\"span12\" ng-model=\"project.scrumMaster\"\n" +
    "                        ng-options=\"user.$id() as user.getFullName() for user in scrumMasterCandidates()\" required>\n" +
    "                    <option value=\"\">-- 选择 --</option>\n" +
    "                </select>\n" +
    "                <label>开发团队</label>\n" +
    "                <table class=\"table table-bordered table-condensed table-striped table-hover\">\n" +
    "                    <thead>\n" +
    "                        <tr>\n" +
    "                            <th>用户</th>\n" +
    "                            <th>&nbsp;</th>\n" +
    "                        </tr>\n" +
    "                    </thead>\n" +
    "                    <tbody>\n" +
    "                        <tr ng-repeat=\"userId in project.teamMembers\">\n" +
    "                            <td>{{usersLookup[userId].getFullName()}}</td>\n" +
    "                            <td>\n" +
    "                                <button class=\"btn btn-small\" ng-click=\"removeTeamMember(userId)\" ng-disabled=\"!selTeamMember\"></button>\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                    </tbody>\n" +
    "                </table>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"row-fluid\">\n" +
    "            <hr>\n" +
    "            <crud-buttons class=\"span12\"></crud-buttons>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "</div>");
}]);

angular.module("admin/projects/projects-list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("admin/projects/projects-list.tpl.html",
    "<table class=\"table table-bordered table-condensed table-striped table-hover\"> <!-- projectsListCtrl服务 -->\n" +
    "    <thead>\n" +
    "        <tr>\n" +
    "            <th>名称</th>\n" +
    "            <th>描述</th>\n" +
    "        </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "        <tr ng-repeat=\"project in projects\" ng-click=\"edit(project.$id())\">\n" +
    "            <td>{{project.name}}</td>\n" +
    "            <td>{{project.desc}}</td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>\n" +
    "<div class=\"well\">\n" +
    "    <button class=\"btn\" ng-click=\"new()\">新建项目</button>\n" +
    "</div>");
}]);

angular.module("header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("header.tpl.html",
    "<div class=\"navbar\" ng-controller=\"HeaderCtrl\">\n" +
    "    <div class=\"navbar-inner\">\n" +
    "        <a class=\"brand\" ng-click=\"home()\">Scrum</a>\n" +
    "        <ul class=\"nav\">\n" +
    "            <li ng-class=\"{active:isNavBarActive('projectsInfo')}\"><a href=\"/projectsInfo\">当前的项目</a></li>\n" +
    "        </ul>\n" +
    "        <ul class=\"nav\" ng-show=\"isAuthenticated()\">\n" +
    "            <li ng-class=\"{active:isNavBarActive('projects')}\"><a href=\"/projects\">我的项目</a></li>\n" +
    "            <li class=\"dropdown\" ng-class=\"{active:isNavBarActive('admin'),open : isAdminOpen}\">\n" +
    "                <a id=\"adminmenu\" type=\"button\" class=\"dropdown-toggle\" ng-click=\"isAdminOpen=!isAdminOpen\">管理<b class=\"caret\"></b></a>\n" +
    "                <ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"adminmenu\">\n" +
    "                    <li><a tabindex=\"-1\" href=\"/admin/projects\" ng-click=\"isAdminOpen=false\">管理项目</a></li>\n" +
    "                    <li><a tabindex=\"-1\" href=\"/admin/users\" ng-click=\"isAdminOpen=false\">管理用户</a></li>\n" +
    "                </ul>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "        <ul class=\"nav pull-right\" ng-show=\"hasPendingRequests()\">\n" +
    "            <li class=\"divider-vertical\"></li>\n" +
    "            <li><a href=\"#\"><img src=\"/static/img/spinner.gif\"/></a></li>\n" +
    "        </ul>\n" +
    "        <login-toolbar></login-toolbar>\n" +
    "    </div>\n" +
    "    <div>\n" +
    "        <ul class=\"breadcrumb\">\n" +
    "            <li ng-repeat=\"breadcrumb in breadcrumbs.getAll()\">\n" +
    "                <span class=\"divider\">/</span>\n" +
    "                <ng-switch on=\"$last\">\n" +
    "                    <span ng-switch-when=\"true\">{{breadcrumb.name}}</span>\n" +
    "                    <span ng-switch-default><a href=\"{{breadcrumb.path}}\">{{breadcrumb.name}}</a></span>\n" +
    "                </ng-switch>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("notifications.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("notifications.tpl.html",
    "<div ng-class=\"['alert', 'alert-'+notification.type]\" ng-repeat=\"notification in notifications.getCurrent()\">\n" +
    "    <button class=\"close\" ng-click=\"removeNotification(notification)\">x</button>\n" +
    "    {{notification.message}}\n" +
    "</div>");
}]);

angular.module("projectsInfo/list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projectsInfo/list.tpl.html",
    "<h3>Scrum是一个用于开发和维持复杂产品的框架</h3>\n" +
    "<p>Scrum是一个用于开发和维持复杂产品的框架，是一个增量的、迭代的开发过程。在这个框架中，整个开发过程由若干个短的迭代周期组成，一个短的\n" +
    "迭代周期称为一个Sprint，每个Sprint的建议长度是2到4周（互联网产品的研发可以使用1周的Sprint）。在Scrum中，使用产品Backlog来管理产品的需\n" +
    "求，产品backlog是一个按照商业价值排序的需求列表，列表条目的体现通常为用户故事。Scrum团队总是先开发对客户具有较高价值的需求。在Sprint中，\n" +
    "Scrum团队从产品backlog中挑选最高优先级的需求进行开发。挑选的需求在Scrum计划会议上进过讨论、分析和估算得到相应的任务列表，我们称它为Sprint\n" +
    "backlog。在每个迭代结束时，Scrum团队将递交潜在可支付的产品增量，Scrum起源于软件开发项目，但它适用于任何复杂的或者创新性的项目。</p>");
}]);

angular.module('templates.common', ['security/login/form.tpl.html', 'security/login/toolbar.tpl.html']);

angular.module("security/login/form.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("security/login/form.tpl.html",
    "<form name=\"form\" novalidate class=\"login-form\">\n" +
    "    <div class=\"modal-header\">\n" +
    "        <h4>登录</h4>\n" +
    "    </div>\n" +
    "    <div class=\"modal-body\">\n" +
    "        <div class=\"alert alert-warning\" ng-show=\"authReason\">\n" +
    "            {{authReason}}\n" +
    "        </div>\n" +
    "        <div class=\"alert alert-error\" ng-show=\"authError\">\n" +
    "            {{authError}}\n" +
    "        </div>\n" +
    "        <div class=\"alert alert-info\">请输入你的登录信息</div>\n" +
    "        <label>邮箱</label>\n" +
    "        <input name=\"login\" type=\"email\" ng-model=\"user.email\" required autofocus/>\n" +
    "        <label>密码</label>\n" +
    "        <input name=\"pass\" type=\"password\" ng-model=\"user.password\" required/>\n" +
    "    </div>\n" +
    "    <div class=\"modal-footer\">\n" +
    "        <button class=\"btn btn-primary login\" ng-click=\"login()\" ng-disabled=\"form.$invalid\">登录</button>\n" +
    "        <button class=\"btn clear\" ng-click=\"clearForm()\">清除</button>\n" +
    "        <button class=\"btn btn-warning cancel\" ng-click=\"cancelLogin()\">取消</button>\n" +
    "    </div>\n" +
    "</form>");
}]);

angular.module("security/login/toolbar.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("security/login/toolbar.tpl.html",
    "<ul class=\"nav pull-right\">\n" +
    "    <li class=\"divider-vertical\"></li>\n" +
    "    <li ng-show=\"isAuthenticated()\">\n" +
    "        <a href=\"#\">{{currentUser.firstName}} {{currentUser.lastName}}</a>\n" +
    "    </li>\n" +
    "    <li ng-show=\"isAuthenticated()\" class=\"logout\">\n" +
    "        <form class=\"navbar-form\">\n" +
    "            <button class=\"btn logout\" ng-click=\"logout()\">退出</button>\n" +
    "        </form>\n" +
    "    </li>\n" +
    "    <li ng-hide=\"isAuthenticated()\" class=\"login\">\n" +
    "        <form class=\"navbar-form\">\n" +
    "            <button class=\"btn login\" ng-click=\"login()\">登录</button>\n" +
    "        </form>\n" +
    "    </li>\n" +
    "</ul>");
}]);
