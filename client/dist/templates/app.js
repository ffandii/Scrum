angular.module('templates.app', ['header.tpl.html', 'notifications.tpl.html', 'projectsInfo/list.tpl.html']);

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
