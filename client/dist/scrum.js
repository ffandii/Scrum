/* scrum - v 0.0.1 - 2016-01-16 
https://github.com/ffandii/Scrum 
 * Copyright (c) 2016 ffandii 
*/
 /**
 * Created by Administrator on 2016/1/3 0003.
 */

angular.module('app',[

    'ngRoute',
    'services.localizedMessages',
    'security',
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
    $locationProvider.html5Mode(true);
}]);

angular.module('app').run(['security',function(security){

    //get the current user when the application starts
    //in case they are still logged in from a previous session
    security.requestCurrentUser();

}]);

angular.module('app').controller('AppCtrl', function($scope){

});

angular.module('app').controller('HeaderCtrl', ['$scope','security', function ($scope,security) {

        $scope.isAuthenticated = security.isAuthenticated;
        $scope.isAdmin = security.isAdmin;

    }]);
angular.module('security',[
    'security.service',
    'security.interceptor',
    'security.login'
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
angular.module('templates.app', ['header.tpl.html']);

angular.module("header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("header.tpl.html",
    "<div class=\"navbar\" ng-controller=\"HeaderCtrl\">\n" +
    "    <div class=\"navbar-inner\">\n" +
    "        <a class=\"brand\">Scrum</a>\n" +
    "        <ul class=\"nav\" ng-class=\"false\">\n" +
    "            <li><a href=\"#\">当前的项目</a></li>\n" +
    "        </ul>\n" +
    "        <ul class=\"nav\" ng-show=\"isAuthenticated()\">\n" +
    "            <li><a href=\"#\">我的项目</a></li>\n" +
    "            <li class=\"dropdown\" ng-class=\"{active:true, open:true}\">\n" +
    "                <a id=\"adminmenu\" type=\"button\" class=\"dropdown-toggle\">管理员<b class=\"caret\"></b></a>\n" +
    "                <ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"adminmenu\">\n" +
    "                    <li><a tabindex=\"-1\" href=\"#\">管理项目</a></li>\n" +
    "                    <li><a tabindex=\"-1\" href=\"#\">管理用户</a></li>\n" +
    "                </ul>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "        <ul class=\"nav pull-right\" ng-show=\"false\">\n" +
    "            <li class=\"divider-vertical\"></li>\n" +
    "            <li><a href=\"#\"><img src=\"/static/img/spinner.gif\"/></a></li>\n" +
    "        </ul>\n" +
    "        <login-toolbar></login-toolbar>\n" +
    "    </div>\n" +
    "</div>");
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
