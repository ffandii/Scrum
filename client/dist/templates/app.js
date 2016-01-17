angular.module('templates.app', ['header.tpl.html']);

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
