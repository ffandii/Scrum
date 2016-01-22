angular.module('templates.app', ['admin/projects/projects-edit.tpl.html', 'admin/projects/projects-list.tpl.html', 'admin/users/users-edit.tpl.html', 'admin/users/users-list.tpl.html', 'header.tpl.html', 'notifications.tpl.html', 'projectsInfo/list.tpl.html']);

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
    "                <label>项目管理者</label>\n" +
    "                <select class=\"span12\" ng-model=\"project.scrumMaster\"\n" +
    "                        ng-options=\"user.$id() as user.getFullName() for user in scrumMasterCandidates()\" required>\n" +
    "                    <option value=\"\">-- 选择 --</option>\n" +
    "                </select>\n" +
    "                <label>开发团队</label>\n" +
    "                <table class=\"table table-bordered table-condensed table-striped table-hover\">\n" +
    "                    <thead>\n" +
    "                        <tr>\n" +
    "                            <th>开发人员</th>\n" +
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

angular.module("admin/users/users-edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("admin/users/users-edit.tpl.html",
    "<div class=\"well\">\n" +
    "    <form name=\"form\" novalidate crud-edit=\"user\">\n" +
    "        <legend>开发人员</legend>\n" +
    "        <gravatar email=\"user.email\" size=\"200\" class=\"img-polaroid pull-right\"></gravatar>\n" +
    "        <label for=\"email\">邮箱</label>\n" +
    "        <input class=\"span6\" type=\"email\" id=\"email\" name=\"email\" ng-model=\"user.email\" required unique-email/>\n" +
    "        <span ng-show=\"showError('email','required')\" class=\"help-inline\">这是必填栏.</span>\n" +
    "        <span ng-show=\"showError('email','email')\" class=\"help-inline\">请输入一个有效的邮箱地址.</span>\n" +
    "        <span ng-show=\"showError('email','uniqueEmail')\" class=\"help-inline\">此邮箱地址无效，请输入另一个.</span>\n" +
    "        <label for=\"lastName\">名</label>\n" +
    "        <input class=\"span6\" type=\"text\" id=\"lastName\" name=\"lastName\" ng-model=\"user.lastName\" required/>\n" +
    "        <span ng-show=\"showError('lastName','required')\" class=\"help-inline\">这是必填栏.</span>\n" +
    "        <label for=\"firstName\">姓</label>\n" +
    "        <input class=\"span6\" type=\"text\" id=\"firstName\" name=\"firstName\" ng-model=\"user.firstName\" required/>\n" +
    "        <span ng-show=\"showError('firstName','required')\" class=\"help-inline\">这是必填栏.</span>\n" +
    "        <label for=\"password\">密码</label>\n" +
    "        <input class=\"span6\" type=\"password\" id=\"password\" name=\"password\" ng-model=\"user.password\" required/>\n" +
    "        <span ng-show=\"showError('password','required')\" class=\"help-inline\">这是必填栏.</span>\n" +
    "        <span ng-show=\"showError('passwordRepeat','equal')\" class=\"help-inline\">密码不匹配.</span>\n" +
    "        <label for=\"passwordRepeat\">密码 （重复）</label>\n" +
    "        <input class=\"span6\" type=\"password\" id=\"passwordRepeat\" name=\"passwordRepeat\" ng-model=\"password\" required validate-equals=\"user.password\"/>\n" +
    "        <span ng-show=\"showError('passwordRepeat', 'required')\" class=\"help-inline\">这是必填栏.</span>\n" +
    "        <span ng-show=\"showError('passwordRepeat', 'equal')\" class=\"help-inline\">密码不匹配.</span>\n" +
    "        <label>管理员</label>\n" +
    "        <input type=\"checkbox\" ng-model=\"user.admin\">\n" +
    "        <hr>\n" +
    "        <crud-buttons></crud-buttons>\n" +
    "    </form>\n" +
    "</div>");
}]);

angular.module("admin/users/users-list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("admin/users/users-list.tpl.html",
    "<table class=\"table table-bordered table-condensed table-striped table-hover\">\n" +
    "    <thead>\n" +
    "        <tr>\n" +
    "            <th></th>\n" +
    "            <th>邮箱</th>\n" +
    "            <th>名</th>\n" +
    "            <th>姓</th>\n" +
    "        </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "        <tr ng-repeat=\"user in users\" ng-click=\"edit(user.$id())\">\n" +
    "            <td><gravatar email=\"user.email\" size=\"50\" default-image=\"'monsterid'\"></gravatar></td>\n" +
    "            <td>{{user.email}}</td>\n" +
    "            <td>{{user.lastName}}</td>\n" +
    "            <td>{{user.firstName}}</td>\n" +
    "            <td><button class=\"btn btn-danger remove\" ng-click=\"remove(user,$index,$event)\">删除</button></td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>\n" +
    "<div class=\"well\">\n" +
    "    <button class=\"btn\" ng-click=\"new()\">添加开发人员</button>\n" +
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
