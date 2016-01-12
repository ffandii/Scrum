/* scrum - v 0.0.1 - 2016-01-12 
https://github.com/ffandii/Scrum 
 * Copyright (c) 2016 ffandii 
*/
 /**
 * Created by Administrator on 2016/1/3 0003.
 */

angular.module('app',[

    'ngRoute',
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


angular.module('app').controller('AppCtrl', function($scope){

});

angular.module('security',[
    'security.login'
]);
angular.module('security.login.form', ['services.localizedMessages'])

    .controller('LoginFormController', ['$scope', 'localizedMessages', function( $scope, localizedMessages ){

        //the modal for the form
        $scope.user = {};

        //any error message from failing to login
        $scope.authError = null;

        //the reason that we are being asked to login, for instance , because we tried to access something to which we are not authorized now
        $scope.authReason = localizedMessages.get('login.reason.notAuthorized');

    }]);
angular.module('security.login', ['security.login.form', 'security.login.toolbar']);
angular.module('security.login.toolbar',[])

//the login toolToolbar directive is a reusable widget that can show login or logout button
//and information the current authenticated user

    .directive('loginToolbar', function(){

        var directive = {
            templateUrl : "security/login/toolbar.tpl.html",
            restrict : "E",
            replace : true,
            scope : true  //继承自己的父作用域还是创建一个独立的作用域


        };

        return directive;

    });
angular.module('services.localizedMessages',[])
    .factory('localizedMessages',['$interpolate','I18N_MESSAGES'],function( $interpolate, i18nmessages ){

        var handleNotFound = function( msg, msgKey ){
            return msg || '?' + msgKey + '?';
        };

        return {
            get : function( msgKey, interpolateParams ){
                
                var msg = i18nmessages[msgKey];

                if(msg){
                    return $interpolate(msg)(interpolateParams);
                } else {
                    return handleNotFound(msg, msgKey);
                }

            }
        };

    });
angular.module('templates.app', ['header.tpl.html']);

angular.module("header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("header.tpl.html",
    "<div class=\"navbar\">\n" +
    "    <div class=\"navbar-inner\">\n" +
    "        <a class=\"brand\">Scrum</a>\n" +
    "        <ul class=\"nav\" ng-class=\"false\">\n" +
    "            <li><a href=\"#\">当前的项目</a></li>\n" +
    "        </ul>\n" +
    "        <ul class=\"nav\" ng-show=\"false\">\n" +
    "            <li><a href=\"#\">我的项目</a></li>\n" +
    "            <li class=\"dropdown\">\n" +
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
    "        <button class=\"btn btn-primary login\" ng-disabled=\"form.$invalid\">登录</button>\n" +
    "        <button class=\"btn clear\">清除</button>\n" +
    "        <button class=\"btn btn-warning cancel\">取消</button>\n" +
    "    </div>\n" +
    "</form>");
}]);

angular.module("security/login/toolbar.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("security/login/toolbar.tpl.html",
    "<ul class=\"nav pull-right\">\n" +
    "    <li class=\"divider-vertical\"></li>\n" +
    "    <li ng-show=\"true\">\n" +
    "        <a href=\"#\">樊迪</a>\n" +
    "    </li>\n" +
    "    <li ng-show=\"true\" class=\"logout\">\n" +
    "        <form class=\"navbar-form\">\n" +
    "            <button class=\"btn logout\">退出</button>\n" +
    "        </form>\n" +
    "    </li>\n" +
    "    <li ng-hide=\"false\" class=\"login\">\n" +
    "        <form class=\"navbar-form\">\n" +
    "            <button class=\"btn login\">登录</button>\n" +
    "        </form>\n" +
    "    </li>\n" +
    "</ul>");
}]);
