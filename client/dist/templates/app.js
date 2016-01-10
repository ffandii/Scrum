angular.module('templates.app', ['header.tpl.html']);

angular.module("header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("header.tpl.html",
    "<div class=\"navbar\">\n" +
    "    <div class=\"navbar-inner\">\n" +
    "        <a class=\"brand\">Scrum</a>\n" +
    "        <ul class=\"nav\">\n" +
    "            <li><a href=\"#\">当前项目</a></li>\n" +
    "        </ul>\n" +
    "        <ul class=\"nav\">\n" +
    "            <li><a href=\"#\">我的项目</a></li>\n" +
    "            <li class=\"dropdown\">\n" +
    "                <a id=\"adminmenu\" type=\"button\" class=\"dropdown-toggle\">管理<b class=\"caret\"></b></a>\n" +
    "                <ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"adminmenu\">\n" +
    "                    <li><a tabindex=\"-1\" href=\"#\">管理项目</a></li>\n" +
    "                    <li><a tabindex=\"-1\" href=\"#\">管理用户</a></li>\n" +
    "                </ul>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "        <ul class=\"nav pull-right\">\n" +
    "            <li class=\"divider-vertical\"></li>\n" +
    "            <li><a href=\"#\"><img src=\"/static/img/spinner.gif\"/></a></li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);
