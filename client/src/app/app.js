/**
 * Created by Administrator on 2016/1/3 0003.
 */

angular.module('app',[

    'ngRoute',
    'projectsInfo',
    'projects',
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