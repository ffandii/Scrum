angular.module('templates.app', ['admin/projects/projects-edit.tpl.html', 'admin/projects/projects-list.tpl.html', 'admin/users/users-edit.tpl.html', 'admin/users/users-list.tpl.html', 'header.tpl.html', 'notifications.tpl.html', 'projects/productbacklog/productbacklog-edit.tpl.html', 'projects/productbacklog/productbacklog-list.tpl.html', 'projects/projects-list.tpl.html', 'projects/sprints/tasks/tasks-edit.tpl.html', 'projects/sprints/tasks/tasks-list.tpl.html', 'projectsInfo/list.tpl.html']);

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

angular.module("projects/productbacklog/productbacklog-edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projects/productbacklog/productbacklog-edit.tpl.html",
    "<div class=\"well\">\n" +
    "    <h4>产品待办条目</h4>\n" +
    "    <hr>\n" +
    "    <form name=\"form\" crud-edit=\"backlogItem\">\n" +
    "        <label>名称</label>\n" +
    "        <input type=\"text\" name=\"name\" ng-model=\"backlogItem.name\" class=\"span10\" required autofocus/>\n" +
    "        <label>用户故事</label>  <!-- 列表条目的体现形式为用户故事 -->\n" +
    "        <textarea rows=\"8\" cols=\"10\" ng-model=\"backlogItem.desc\" class=\"span10\" required></textarea>\n" +
    "        <label>优先权</label>\n" +
    "        <input type=\"number\" ng-model=\"backlogItem.priority\" required/>\n" +
    "        <label>评估</label>\n" +
    "        <input type=\"number\" ng-model=\"backlogItem.estimation\" required/>\n" +
    "        <hr>\n" +
    "        <crud-buttons></crud-buttons>\n" +
    "    </form>\n" +
    "</div>");
}]);

angular.module("projects/productbacklog/productbacklog-list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projects/productbacklog/productbacklog-list.tpl.html",
    "<table class=\"table table-bordered table-condensed table-striped table-hover\">\n" +
    "    <thead>\n" +
    "        <tr>\n" +
    "            <th>名称</th>\n" +
    "            <th>描述</th>\n" +
    "            <th>优先权</th>\n" +
    "            <th>评估</th>\n" +
    "        </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "        <tr ng-repeat=\"backlogItem in backlog\" ng-click=\"edit(backlogItem.$id())\">\n" +
    "            <td>{{backlogItem.name}}</td>\n" +
    "            <td>{{backlogItem.desc}}</td>\n" +
    "            <td>{{backlogItem.priority}}</td>\n" +
    "            <td>{{backlogItem.estimation}}</td>\n" +
    "        </tr>\n" +
    "        <tr ng-show=\"!backlog.length()\">\n" +
    "            <td colspan=\"4\">待办列表中尚无条目</td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>\n" +
    "<div class=\"well\">\n" +
    "    <button class=\"btn\" ng-click=\"new\">新建待办条目</button>\n" +
    "</div>");
}]);

angular.module("projects/projects-list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projects/projects-list.tpl.html",
    "<table class=\"table table-bordered table-condensed table-striped table-hover\">\n" +
    "    <thead>\n" +
    "        <tr>\n" +
    "            <th class=\"span3\">名称</th>\n" +
    "            <th class=\"span5\">描述</th>\n" +
    "            <th class=\"span2\">我的角色</th>\n" +
    "            <th class=\"span2\">工具</th>\n" +
    "        </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "        <tr ng-repeat=\"project in projects\">\n" +
    "            <td ng-click=\"manageBacklog(project)\">{{project.name}}</td>\n" +
    "            <td ng-click=\"manageBacklog(project)\">{{project.desc}}</td>\n" +
    "            <td>{{getMyRoles(project)}}</td>\n" +
    "            <td>\n" +
    "                <a ng-click=\"manageBacklog(project)\">产品待办条目</a>\n" +
    "                <a ng-click=\"manageSprints(project)\">冲刺（迭代）</a>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>");
}]);

angular.module("projects/sprints/tasks/tasks-edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projects/sprints/tasks/tasks-edit.tpl.html",
    "<div class=\"well\">\n" +
    "    <div class=\"row-fluid\">\n" +
    "        <form name=\"form\" crud-edit=\"task\">\n" +
    "            <div class=\"span6\">\n" +
    "                <label>任务名称</label>\n" +
    "                <input type=\"text\" name=\"name\" ng-model=\"task.name\" class=\"span10\" required autofocus/>\n" +
    "                <label>产品待办条目</label>\n" +
    "                <select name=\"productBacklog\" class=\"span10\" ng-model=\"task.productBacklogItemId\" ng-options=\"backlogItem.$id() as backlogItem.name for backlogItem in sprintBacklogItems\" required></select>\n" +
    "                <label>任务描述</label>\n" +
    "                <textarea rows=\"8\" cols=\"10\" ng-model=\"task.desc\" class=\"span10\" required></textarea>\n" +
    "            </div>\n" +
    "            <div class=\"span6\">\n" +
    "                <label>评估</label>\n" +
    "                <input type=\"number\" name=\"estimation\" ng-model=\"task.estimation\" class=\"span5\" required/>\n" +
    "                <label>保留</label>\n" +
    "                <input type=\"number\" name=\"remaining\" ng-model=\"task.remaining\" class=\"span5\" required/>\n" +
    "                <label>状态</label>\n" +
    "                <select name=\"state\" ng-model=\"task.state\" class=\"span5\" required ng-options=\"state for state in statesEnum\"></select>\n" +
    "                <label>分配给</label>\n" +
    "                <select name=\"state\" ng-model=\"task.assignedUserId\" class=\"span10\" ng-model=\"task.assignedUserId\" class=\"span10\" ng-options=\"teamMember.$id() as teamMember.getFullName() for teamMember in teamMembers\"></select>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <hr>\n" +
    "    <crud-buttons></crud-buttons>\n" +
    "</div>");
}]);

angular.module("projects/sprints/tasks/tasks-list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projects/sprints/tasks/tasks-list.tpl.html",
    "<table class=\"table table-bordered table-condensed table-striped table-hover\">\n" +
    "    <thead>\n" +
    "        <tr>\n" +
    "            <th class=\"span8\">任务名称</th>\n" +
    "            <th class=\"span1\">评估</th>\n" +
    "            <th class=\"span1\">保留</th>\n" +
    "            <th class=\"span2\">工具</th>\n" +
    "        </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "        <tr ng-repeat=\"tast in tasks\">\n" +
    "            <td ng-click=\"edit(task.$id())\">{{task.name}}</td>\n" +
    "            <td>{{task.estimation}}</td>\n" +
    "            <td>{{task.remaining}}</td>\n" +
    "            <td></td>\n" +
    "        </tr>\n" +
    "        <tr ng-show=\"!tasks.length()\">\n" +
    "            <td colspan=\"4\">这轮迭代（冲刺）尚无任务定义</td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>\n" +
    "<div class=\"well\">\n" +
    "    <button class=\"btn\" ng-click=\"new()\">新建任务</button>\n" +
    "</div>");
}]);

angular.module("projectsInfo/list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projectsInfo/list.tpl.html",
    "<h3>Scrum</h3>\n" +
    "<p>\n" +
    "    敏捷开发时一种以人为核心、迭代、循环渐进的开发方式。\n" +
    "    怎么理解呢？首先，我们要理解它不是一门技术，它是一种开发方法，也就是一种软件开发的流程，它会指导我们用规定的环节一步一步来完成项目的开发。\n" +
    "    而这种开发方式的主要驱动核心为人，它采用的是迭代式开发。\n" +
    "</p>\n" +
    "\n" +
    "<h3>为什么说是以人为本？</h3>\n" +
    "<p>\n" +
    "    我们大部分人都学过瀑布开发模式，它是以文档为驱动的，为什么呢？因为在瀑布的整个开发过程中，要写大量的文档，把需求文档写出来后，开发人员\n" +
    "    都是根据文档进行开发的，一切以文档为依据；而敏捷开发它只写有必要的文档，或者尽量少些文档，敏捷开发注重的是人与人之间，面对面的交流，所以\n" +
    "    它强调的是以人为核心。\n" +
    "</p>\n" +
    "\n" +
    "<h3>什么是迭代？</h3>\n" +
    "<p>\n" +
    "    迭代是指把一个复杂且开发周期很长的开发任务，分解成为很多小的周期内可完成的任务，这样的一个周期就是一个迭代的过程；同时，每一次迭代，都可以\n" +
    "    生成或开发出可以交付的软件产品。\n" +
    "</p>\n" +
    "\n" +
    "<h3>scrum开发中的三大角色</h3>\n" +
    "\n" +
    "<p>\n" +
    "    产品负责人（Product Owner）\n" +
    "    主要负责确定产品的功能和达到要求的标准，指定软件的发布日期和交付的内容，同时有权利接受或拒绝开发团队的开发成果。\n" +
    "\n" +
    "    流程管理员（Scrum Master）\n" +
    "    主要负责Scrum流程在整个项目中的顺利实施和完成，以及清除挡在客户和开发工作之间的障碍，使得客户可以直接驱动开发。\n" +
    "\n" +
    "    开发团队（Scrum Team）\n" +
    "    主要负责软件产品在Scrum规定流程下进行开发工作，人数控制在5~10人之间，每个成员可能负责不同的技术方面，但要求成员必须有很强的自我管理能力，\n" +
    "    同时具备一定的表达能力，成员可以采用任何工作方式，只要达到Sprint目标。\n" +
    "</p>\n" +
    "\n" +
    "<h3>如何进行Scrum开发</h3>\n" +
    "<p>\n" +
    "    1.我们首先需要确定一个Product Backlog（按优先顺序排列的一个产品需求列表），这个由Product Owner来负责。\n" +
    "\n" +
    "    2.Scrum团队根据Product需求列表，做工作量的预估和安排。\n" +
    "\n" +
    "    3.有了Product Backlog列表，我们需要通过Sprint计划会议来挑选一个Story作为本次迭代要完成的目标，这个目标的时间周期为1~4个星期，然后把\n" +
    "    这个Story进行细化，形成一个Sprint Backlog。\n" +
    "\n" +
    "    4.Sprint Backlog是由Scrum Team去完成的，每个成员再根据Sprint Backlog细化为更小的任务（细到每个任务的工作量在2天内完成）。\n" +
    "\n" +
    "    5.在Scrum Team完成计划会议上挑选出来的Sprint Backlog过程中，需要进行每日站立会议，每次会议控制在15分钟，每个人都必须发言，并且向所有\n" +
    "    成员当面汇报你今天做了什么，并且向所有成员汇报你今天要完成什么，同时遇到不能解决的问题也能提出，每个人回答完成后要走到黑板前更新自己的\n" +
    "    Sprint燃尽图。\n" +
    "\n" +
    "    6.做到每日集成，也就是每天都要有一个可以成功编译、可以演示的版本，\n" +
    "\n" +
    "    8.当一个Story也就是一个Sprint完成时，要进行演示会议，也称为评审会议，产品负责人和客户都要参加，每个成员都要向他们演示自己完成的软件产品。\n" +
    "\n" +
    "    9.最后就是进行Sprint回顾会议，也就是总结会议，以轮流发言方式进行，每个人都要发言，总结并且改进不足之处，放入下一轮Sprint的产品需求中。\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);
