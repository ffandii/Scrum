/* scrum - v 0.0.1 - 2016-04-11 
https://github.com/ffandii/Scrum 
 * Copyright (c) 2016 ffandii 
*/
 angular.module('admin',['admin-projects', 'admin-users']);
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


angular.module('admin-users-edit',[
    'services.crud',
    'services.i18nNotifications',
    'admin-users-edit-uniqueEmail',
    'admin-users-edit-validateEquals'
])

.controller('UsersEditCtrl',['$scope', '$location', 'i18nNotifications', 'user', function($scope, $location, i18nNotifications, user){

        $scope.user = user;
        $scope.password = user.password;

        $scope.onSave = function(user){
            i18nNotifications.pushForNextRoute('crud.user.save.success', 'success', { id : user.$id() });
            $location.path('/admin/users');
        };

        $scope.onError = function(){
            i18nNotifications.pushForCurrentRoute('crud.user.save.error', 'error');
        };

        $scope.onRemove = function(user){
            i18nNotifications.pushForNextRoute('crud.user.remove.success', 'success', {id : user.$id()} );
            $location.path('/admin/users');
        };

    }]);
angular.module('admin-users-list',[
    'services.crud',
    'services.i18nNotifications'
])

.controller('UsersListCtrl', ['$scope', 'crudListMethods', 'users', 'i18nNotifications', function( $scope, crudListMethods, users, i18nNotifications ){

        $scope.users = users;

        angular.extend($scope, crudListMethods('/admin/users'));

        $scope.remove = function(user, $index, $event){
            $event.stopPropagation();
            user.$remove(function(){
                $scope.users.splice($index,1);
                i18nNotifications.pushForCurrentRoute('crud.user.remove.success', 'success', {id: user.$id()});
            }, function(){
                i18nNotifications.pushForCurrentRoute('crud.user.remove.error', 'error', {id : user.$id()});
            });
        };
    }]);
angular.module('admin-users', [
    'admin-users-list',
    'admin-users-edit',

    'services.crud',
    'security.authorization',
    'directives.gravatar'
])

.config(['crudRouteProvider','securityAuthorizationProvider', function(crudRouteProvider, securityAuthorizationProvider){

        crudRouteProvider.routesFor('Users', 'admin')
            .whenList({
                users : ['Users', function(Users){ return Users.all(); }],
                currentUser : securityAuthorizationProvider.requireAdminUser
            })
            .whenNew({
                user : ['Users',function(Users){ return new Users(); }],
                currentUser : securityAuthorizationProvider.requireAdminUser
            })
            .whenEdit({
                user : ['$route','Users', function($route, Users){
                    return Users.getById($route.current.params.itemId);  //这里之前有一个bug
                }],
                currentUser : securityAuthorizationProvider.requireAdminUser
            });

    }]);
angular.module('admin-users-edit-uniqueEmail',['resources.users'])

/*
a validation directive to ensure that the model contains a unique email address
*/

.directive('uniqueEmail', ['Users',function(Users){

        return {

            require : "ngModel",
            restrict : "A",
            link : function(scope, el, attrs, ctrl){

                ctrl.$parsers.push(function(viewValue){

                    if( viewValue ){
                        Users.query({email: viewValue}, function(users){
                            if(users.length === 0){
                                ctrl.$setValidity('uniqueEmail', true);
                            } else {
                                ctrl.$setValidity('uniqueEmail', false);
                            }
                        });
                    }

                    return viewValue;

                });

            }

        };

    }]);
angular.module('admin-users-edit-validateEquals',[])

/*
a validation directive to ensure that this model has the same value as some other
*/

.directive('validateEquals',function(){

        return {
            restrict : 'A',
            require : 'ngModel',
            link : function(scope, elm, attrs, ctrl){

                function validateEqual(myValue, otherValue){
                    if(myValue === otherValue){
                        ctrl.$setValidity('equal', true);
                        return myValue;
                    } else {
                        ctrl.$setValidity('equal',false);
                        return undefined;
                    }
                }

                scope.$watch(attrs.validateEquals,function(otherModelValue){
                    ctrl.$setValidity('equal', ctrl.$viewValue === otherModelValue );
                });

                ctrl.$parsers.push(function(viewValue){
                    return validateEqual(viewValue, scope.$eval(attrs.validateEquals));
                });

                ctrl.$formatters.push(function(modelValue){
                    return validateEqual(modelValue, scope.$eval(attrs.validateEquals));
                });

            }
        };

    });
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

angular.module('app').constant('MONGOLAB_CONFIG',{  //connect mongodb config
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

    //当应用启动时立即获取当前用户
    //可能用户仍然存在于之前的session中
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

        $scope.hasPendingRequests = function() {  //是否正在进行请求
            return httpRequestTracker.hasPendingRequests();
        };

        $scope.isAdminOpen = false;

    }]);
angular.module('dashboard',['resources.projects','resources.tasks'])

.config(['$routeProvider',function($routeProvider){
        $routeProvider.when('/dashboard',{
            templateUrl:'dashboard/dashboard.tpl.html',
            controller:'DashboardCtrl',
            resolve:{
                projects: ['Projects',function(Projects){
                    return Projects.all();
                }],
                tasks: ['Tasks',function(Tasks){
                    return Tasks.all();
                }]
            }
        });
    }])

.controller('DashboardCtrl',['$scope','$location','projects','tasks',function($scope, $location, projects, tasks){
        $scope.projects = projects;
        $scope.tasks = tasks;

        $scope.manageBacklog = function (projectId) {
            $location.path('/projects/' + projectId + '/productbacklog');
        };

        $scope.manageSprints = function (projectId) {
            $location.path('/projects/' + projectId + '/sprints');
        };

    }]);
angular.module('productbacklog', ['resources.productBacklog','services.crud'])

.config(['crudRouteProvider', function(crudRouteProvider){

        var projectId = ['$route', function($route){
            return $route.current.params.projectId;
        }];

        crudRouteProvider.routesFor('ProductBacklog','projects','projects/:projectId')
            .whenList({
                projectId : projectId,
                backlog : ['$route','ProductBacklog',function($route, ProductBacklog){
                    return ProductBacklog.forProject($route.current.params.projectId);
                }]
            })

            .whenNew({  //create a new product backlog item route
                projectId : projectId,
                backlogItem : ['$route', 'ProductBacklog',function($route,ProductBacklog){
                    return new ProductBacklog({projectId : $route.current.params.projectId});
                }]
            })
            .whenEdit({
                projectId : projectId,
                backlogItem : ['$route','ProductBacklog', function($route, ProductBacklog){
                    return ProductBacklog.getById($route.current.params.itemId); //这里是itemId,弄清楚
                }]
            });

    }])

.controller('ProductBacklogListCtrl',['$scope','crudListMethods','projectId','backlog', function($scope,crudListMethods,projectsId, backlog){
        $scope.backlog = backlog;
        angular.extend($scope, crudListMethods('/projects/'+projectsId+'/productbacklog'));
    }])

.controller('ProductBacklogEditCtrl',['$scope','$location','projectId','backlogItem',function($scope,$location,projectId,backlogItem){

        $scope.backlogItem = backlogItem;

        $scope.onSave = function(){
            $location.path('/projects/'+projectId+'/productbacklog');
        };

        $scope.onError = function(){
            $scope.updateError = true;
        };

    }]);
angular.module('projects', ['resources.projects', 'productbacklog', 'sprints', 'security.authorization'])

    .config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
        $routeProvider.when('/projects', {
            templateUrl:'projects/projects-list.tpl.html',
            controller:'ProjectsViewCtrl',
            resolve:{
                projects:['Projects', function (Projects) {
                    return Projects.all();
                }],
                authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
            }
        });
    }])

    .controller('ProjectsViewCtrl', ['$scope', '$location', 'projects', 'security', function ($scope, $location, projects, security) {
        $scope.projects = projects;

        $scope.viewProject = function (project) {
            $location.path('/projects/'+project.$id());
        };

        $scope.manageBacklog = function (project) {
            $location.path('/projects/'+project.$id()+'/productbacklog');
        };

        $scope.manageSprints = function (project) {
            $location.path('/projects/'+project.$id()+'/sprints');
        };

        $scope.getMyRoles = function(project) {
            if ( security.currentUser ) {
                return project.getRoles(security.currentUser.id);
            }
        };
    }]);

angular.module('sprints', ['resources.sprints', 'services.crud', 'tasks'])

    .config(['crudRouteProvider', function(crudRouteProvider){

        var projectId = ['$route', function($route) {
            return $route.current.params.projectId;
        }];

        var productBacklog = ['$route', 'ProductBacklog', function ($route, ProductBacklog) {
            return ProductBacklog.forProject($route.current.params.projectId);
        }];

        crudRouteProvider.routesFor('Sprints', 'projects', 'projects/:projectId')
            .whenList({
                projectId: projectId,
                sprints: ['$route', 'Sprints', function($route, Sprints){
                    return Sprints.forProject($route.current.params.projectId);
                }]
            })

            .whenNew({
                projectId: projectId,
                sprint: ['$route', 'Sprints', function($route, Sprints){
                    return new Sprints({projectId:$route.current.params.projectId});
                }],
                productBacklog : productBacklog
            })

            .whenEdit({
                projectId: projectId,
                sprint: ['$route', 'Sprints', function($route, Sprints){
                    return Sprints.getById($route.current.params.itemId);
                }],
                productBacklog : productBacklog
            });

    }])

    .controller('SprintsListCtrl', ['$scope', '$location', 'crudListMethods', 'projectId', 'sprints', function($scope, $location, crudListMethods, projectId, sprints){
        $scope.sprints = sprints;

        angular.extend($scope, crudListMethods('/projects/'+projectId+'/sprints'));

        $scope.tasks = function (sprint) {
            $location.path('/projects/'+projectId+'/sprints/'+sprint.$id()+'/tasks');
        };
    }])

    .controller('SprintsEditCtrl', ['$scope', '$location', 'projectId', 'sprint', 'productBacklog', function($scope, $location, projectId, sprint, productBacklog){

        $scope.productBacklog = productBacklog;
        $scope.sprint = sprint;

        $scope.onSave = function () {
            $location.path('/projects/'+projectId+'/sprints');
        };
        $scope.onError = function () {
            $scope.updateError = true;
        };

        $scope.sprint.sprintBacklog = $scope.sprint.sprintBacklog || [];

        $scope.productBacklogLookup = {};
        angular.forEach($scope.productBacklog, function (productBacklogItem) {
            $scope.productBacklogLookup[productBacklogItem.$id()] = productBacklogItem;
        });

        $scope.viewProductBacklogItem = function (productBacklogItemId) {
            $location.path('/projects/'+projectId+'/productbacklog/'+productBacklogItemId);
        };

        $scope.addBacklogItem = function (backlogItem) {
            $scope.sprint.sprintBacklog.push(backlogItem.$id());
        };

        $scope.removeBacklogItem = function (backlogItemId) {
            $scope.sprint.sprintBacklog.splice($scope.sprint.sprintBacklog.indexOf(backlogItemId),1);
        };

        $scope.estimationInTotal = function () {
            var totalEstimation = 0;
            angular.forEach(sprint.sprintBacklog, function (backlogItemId) {
                totalEstimation += $scope.productBacklogLookup[backlogItemId].estimation;
            });
            return totalEstimation;
        };

        $scope.notSelected = function (productBacklogItem) {
            return $scope.sprint.sprintBacklog.indexOf(productBacklogItem.$id())===-1;
        };
    }]);
angular.module('tasks', ['resources.tasks', 'services.crud'])

    .config(['crudRouteProvider', function (crudRouteProvider) {

        var sprintBacklogItems = ['Sprints', 'ProductBacklog', '$route', function (Sprints, ProductBacklog, $route) {
            var sprintPromise = Sprints.getById($route.current.params.sprintId);
            return sprintPromise.then(function (sprint) {
                return ProductBacklog.getByIds(sprint.sprintBacklog);
            });
        }];

        var teamMembers = ['Projects', 'Users', '$route', function (Projects, Users, $route) {
            var projectPromise = Projects.getById($route.current.params.projectId);
            return projectPromise.then(function(project){
                return Users.getByIds(project.teamMembers);
            });
        }];

        crudRouteProvider.routesFor('Tasks', 'projects/sprints', 'projects/:projectId/sprints/:sprintId')

            .whenList({
                tasks:['Tasks', '$route', function (Tasks, $route) {
                    return Tasks.forSprint($route.current.params.sprintId);
                }]
            })

            .whenNew({
                task:['Tasks', '$route', function (Tasks, $route) {
                    return new Tasks({
                        projectId:$route.current.params.projectId,
                        sprintId:$route.current.params.sprintId,
                        state:Tasks.statesEnum[0]
                    });
                }],
                sprintBacklogItems:sprintBacklogItems,
                teamMembers:teamMembers
            })

            .whenEdit({
                task:['Tasks', '$route', function (Tasks, $route) {
                    return Tasks.getById($route.current.params.itemId);
                }],
                sprintBacklogItems:sprintBacklogItems,
                teamMembers:teamMembers
            });
    }])

    .controller('TasksListCtrl', ['$scope', 'crudListMethods', '$route', 'tasks', function ($scope, crudListMethods, $route, tasks) {
        $scope.tasks = tasks;

        var projectId = $route.current.params.projectId;
        var sprintId = $route.current.params.sprintId;
        angular.extend($scope, crudListMethods('/projects/' + projectId + '/sprints/' + sprintId + '/tasks'));
    }])

    .controller('TasksEditCtrl', ['$scope', '$location', '$route', 'Tasks', 'sprintBacklogItems', 'teamMembers', 'task', function ($scope, $location, $route, Tasks, sprintBacklogItems, teamMembers, task) {
        $scope.task = task;
        $scope.statesEnum = Tasks.statesEnum;
        $scope.sprintBacklogItems = sprintBacklogItems;
        $scope.teamMembers = teamMembers;

        $scope.onSave = function () {
            $location.path('/admin/users');
        };
        $scope.onError = function() {
            $scope.updateError = true;
        };
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
angular.module('directives.crud.buttons', [])

    .directive('crudButtons', function () {
        return {
            restrict:'E',
            replace:true,
            template:
            '<div>' +
            '  <button type="button" class="btn btn-primary save" ng-disabled="!canSave()" ng-click="save()">保存</button>' +
            '  <button type="button" class="btn btn-warning revert" ng-click="revertChanges()" ng-disabled="!canRevert()">撤销更改</button>'+
            '  <button type="button" class="btn btn-danger remove" ng-click="remove()" ng-show="canRemove()">删除</button>'+
            '</div>'
        };
    });
angular.module('directives.crud.edit', [])

//把这样一个指令添加到form元素或者其内， 将会管理资源上的crud操作
//资源必须暴露以下这些方法: $saveOrUpdate() $id() and $remove()

.directive('crudEdit', ['$parse', function($parse){

        return {

            scope : true,
            require : "^form",  //设置要注入当前指令链接函数中的其他指令的控制器
            //这个指令只能作为一个属性出现
            link : function(scope,element,attrs,form){  //link用来将作用域与指令链接起来

                var resourceGetter = $parse(attrs.crudEdit);  //获取的对象
                var resourceSetter = resourceGetter.assign;   //用于设置该对象
                //store the object for easy access
                var resource = resourceGetter(scope);  //整个scope作用域中包含的资源
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
                    var fn = scope.$eval(attrs[attrName]);  //引入需要的函数
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
angular.module('directives.gravatar',[])

//a simple directive to display a gravatar  image given an email
.directive('gravatar', ['md5',function(md5){

        return {
            restrict : "E",
            template : '<img ng-src="http://www.gravatar.com/avatar/{{hash}}{{getParams}}"/>',
            replace : true,
            scope : {
                email : '=',
                size : '=',
                defaultImage : '=',
                forceDefault : '='
            },
            link : function(scope, element, attr){
                scope.options = {};
                scope.$watch('email', function(email){
                    if(email){
                        scope.hash = md5(email.trim().toLowerCase());
                    }
                });
                scope.$watch('size', function(size){
                    scope.options.s = ( angular.isNumber(size)? size : undefined );
                    generateParams();
                });
                scope.$watch('forceDefault',function(forceDefault){
                    scope.options.f = forceDefault ? 'y' : undefined;
                    generateParams();
                });
                scope.$watch('defaultImage', function(defaultImage){
                    scope.options.d = defaultImage ? defaultImage : undefined;
                    generateParams();
                });
                function generateParams(){
                    var options = [];
                    scope.getParams = '';
                    angular.forEach(scope.options, function(value, key){
                        if(value){
                            options.push(key+"="+encodeURIComponent(value));
                        }
                    });
                    if(options.length > 0){
                        scope.getParams = '?'+options.join('&');
                    }
                }
            }
        };

    }])
.factory('md5',function(){  //md5服务

        function md5cycle(x, k) {
            var a = x[0],
                b = x[1],
                c = x[2],
                d = x[3];

            a = ff(a, b, c, d, k[0], 7, -680876936);
            d = ff(d, a, b, c, k[1], 12, -389564586);
            c = ff(c, d, a, b, k[2], 17, 606105819);
            b = ff(b, c, d, a, k[3], 22, -1044525330);
            a = ff(a, b, c, d, k[4], 7, -176418897);
            d = ff(d, a, b, c, k[5], 12, 1200080426);
            c = ff(c, d, a, b, k[6], 17, -1473231341);
            b = ff(b, c, d, a, k[7], 22, -45705983);
            a = ff(a, b, c, d, k[8], 7, 1770035416);
            d = ff(d, a, b, c, k[9], 12, -1958414417);
            c = ff(c, d, a, b, k[10], 17, -42063);
            b = ff(b, c, d, a, k[11], 22, -1990404162);
            a = ff(a, b, c, d, k[12], 7, 1804603682);
            d = ff(d, a, b, c, k[13], 12, -40341101);
            c = ff(c, d, a, b, k[14], 17, -1502002290);
            b = ff(b, c, d, a, k[15], 22, 1236535329);

            a = gg(a, b, c, d, k[1], 5, -165796510);
            d = gg(d, a, b, c, k[6], 9, -1069501632);
            c = gg(c, d, a, b, k[11], 14, 643717713);
            b = gg(b, c, d, a, k[0], 20, -373897302);
            a = gg(a, b, c, d, k[5], 5, -701558691);
            d = gg(d, a, b, c, k[10], 9, 38016083);
            c = gg(c, d, a, b, k[15], 14, -660478335);
            b = gg(b, c, d, a, k[4], 20, -405537848);
            a = gg(a, b, c, d, k[9], 5, 568446438);
            d = gg(d, a, b, c, k[14], 9, -1019803690);
            c = gg(c, d, a, b, k[3], 14, -187363961);
            b = gg(b, c, d, a, k[8], 20, 1163531501);
            a = gg(a, b, c, d, k[13], 5, -1444681467);
            d = gg(d, a, b, c, k[2], 9, -51403784);
            c = gg(c, d, a, b, k[7], 14, 1735328473);
            b = gg(b, c, d, a, k[12], 20, -1926607734);

            a = hh(a, b, c, d, k[5], 4, -378558);
            d = hh(d, a, b, c, k[8], 11, -2022574463);
            c = hh(c, d, a, b, k[11], 16, 1839030562);
            b = hh(b, c, d, a, k[14], 23, -35309556);
            a = hh(a, b, c, d, k[1], 4, -1530992060);
            d = hh(d, a, b, c, k[4], 11, 1272893353);
            c = hh(c, d, a, b, k[7], 16, -155497632);
            b = hh(b, c, d, a, k[10], 23, -1094730640);
            a = hh(a, b, c, d, k[13], 4, 681279174);
            d = hh(d, a, b, c, k[0], 11, -358537222);
            c = hh(c, d, a, b, k[3], 16, -722521979);
            b = hh(b, c, d, a, k[6], 23, 76029189);
            a = hh(a, b, c, d, k[9], 4, -640364487);
            d = hh(d, a, b, c, k[12], 11, -421815835);
            c = hh(c, d, a, b, k[15], 16, 530742520);
            b = hh(b, c, d, a, k[2], 23, -995338651);

            a = ii(a, b, c, d, k[0], 6, -198630844);
            d = ii(d, a, b, c, k[7], 10, 1126891415);
            c = ii(c, d, a, b, k[14], 15, -1416354905);
            b = ii(b, c, d, a, k[5], 21, -57434055);
            a = ii(a, b, c, d, k[12], 6, 1700485571);
            d = ii(d, a, b, c, k[3], 10, -1894986606);
            c = ii(c, d, a, b, k[10], 15, -1051523);
            b = ii(b, c, d, a, k[1], 21, -2054922799);
            a = ii(a, b, c, d, k[8], 6, 1873313359);
            d = ii(d, a, b, c, k[15], 10, -30611744);
            c = ii(c, d, a, b, k[6], 15, -1560198380);
            b = ii(b, c, d, a, k[13], 21, 1309151649);
            a = ii(a, b, c, d, k[4], 6, -145523070);
            d = ii(d, a, b, c, k[11], 10, -1120210379);
            c = ii(c, d, a, b, k[2], 15, 718787259);
            b = ii(b, c, d, a, k[9], 21, -343485551);

            x[0] = add32(a, x[0]);
            x[1] = add32(b, x[1]);
            x[2] = add32(c, x[2]);
            x[3] = add32(d, x[3]);

        }

        function cmn(q, a, b, x, s, t) {
            a = add32(add32(a, q), add32(x, t));
            return add32((a << s) | (a >>> (32 - s)), b);
        }

        function ff(a, b, c, d, x, s, t) {
            return cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }

        function gg(a, b, c, d, x, s, t) {
            return cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }

        function hh(a, b, c, d, x, s, t) {
            return cmn(b ^ c ^ d, a, b, x, s, t);
        }

        function ii(a, b, c, d, x, s, t) {
            return cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        function md51(s) {
            txt = '';
            var n = s.length,
                state = [1732584193, -271733879, -1732584194, 271733878],
                i;
            for (i = 64; i <= s.length; i += 64) {
                md5cycle(state, md5blk(s.substring(i - 64, i)));
            }
            s = s.substring(i - 64);
            var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (i = 0; i < s.length; i++) {
                tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
            }
            tail[i >> 2] |= 0x80 << ((i % 4) << 3);
            if (i > 55) {
                md5cycle(state, tail);
                for (i = 0; i < 16; i++) {
                    tail[i] = 0;
                }
            }
            tail[14] = n * 8;
            md5cycle(state, tail);
            return state;
        }

        /* there needs to be support for Unicode here,
         * unless we pretend that we can redefine the MD-5
         * algorithm for multi-byte characters (perhaps
         * by adding every four 16-bit characters and
         * shortening the sum to 32 bits). Otherwise
         * I suggest performing MD-5 as if every character
         * was two bytes--e.g., 0040 0025 = @%--but then
         * how will an ordinary MD-5 sum be matched?
         * There is no way to standardize text to something
         * like UTF-8 before transformation; speed cost is
         * utterly prohibitive. The JavaScript standard
         * itself needs to look at this: it should start
         * providing access to strings as preformed UTF-8
         * 8-bit unsigned value arrays.
         */

        function md5blk(s) { /* I figured global was faster.   */
            var md5blks = [],
                i; /* Andy King said do it this way. */
            for (i = 0; i < 64; i += 4) {
                md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
            }
            return md5blks;
        }

        var hex_chr = '0123456789abcdef'.split('');

        function rhex(n) {
            var s = '', j = 0;
            for (; j < 4; j++) {
                s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
            }
            return s;
        }

        function hex(x) {
            for (var i = 0; i < x.length; i++) {
                x[i] = rhex(x[i]);
            }
            return x.join('');
        }

        function md5(s) {
            return hex(md51(s));
        }

        /* this function is much faster,
         so if possible we use it. Some IEs
         are the only ones I know of that
         need the idiotic second function,
         generated by an if clause.  */

        add32 = function(a, b) {
            return (a + b) & 0xFFFFFFFF;
        };

        if (md5('hello') !== '5d41402abc4b2a76b9719d911017c592') {
            add32 = function (x, y) {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                    msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            };
        }

        return md5;

    });
angular.module('resources.productBacklog', ['mongolabResource']);  //待办列表

angular.module('resources.productBacklog').factory('ProductBacklog', ['mongolabResource', function(mongolabResource){

    var ProductBacklog = mongolabResource('productBacklog');  //产品待办列表

    ProductBacklog.forProject = function(projectId){
        return ProductBacklog.query({ projectId : projectId });
    };

    return ProductBacklog;

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
angular.module('resources.sprints', ['mongolabResource']);

angular.module('resources.sprints').factory('Sprints',['mongolabResource', function(mongolabResource){

    var Sprints =mongolabResource('sprints');

    Sprints.forProject = function( projectId ){
        return Sprints.query({ projectId : projectId});
    };

    return Sprints;

}]);
angular.module('resources.tasks', ['mongolabResource']);

angular.module('resources.tasks').factory('Tasks', ['mongolabResource', function(mongolabResource){

    var Tasks = mongolabResource('tasks');
    Tasks.statesEnum = ['TODO','IN_DEV','BLOCKED','IN_TEST','DONE'];  //任务进度

    Tasks.forProductBacklogItem = function(productBacklogItem){  //待办列表任务
        return Tasks.query({productBacklogItem : productBacklogItem});
    };

    Tasks.forSprint = function(sprintId){  //冲刺任务
        return Tasks.query({sprintId : sprintId});
    };

    Tasks.forUser = function(userId){  //开发人员任务
        return Tasks.query({ userId : userId });
    };

    Tasks.forProject = function(projectId){
        return Tasks.query({ projectId : projectId });
    };

    return Tasks;

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
//通过这种形式，合并各个模块，然后各个模块间的服务也可以相互引用
angular.module('security',[
    'security.service',
    'security.interceptor',
    'security.login',
    'security.authorization'
]);
//注入$httpProvider服务的响应拦截器
angular.module('security.interceptor', ['security.retryQueue'])

//http拦截器监听授权失败的情形

    .factory('securityInterceptor',['$injector','securityRetryQueue',function($injector,queue){

        return function(promise){

            //中断失败的请求
            return promise.then(null, function( originalResponse ){

                if( originalResponse.status === 401 ){
                    promise = queue.pushRetryFn('unauthorized-server', function retryRequest(){
                        //利用$injector获取$http服务，防止循环依赖
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

        };

        $scope.clearForm = function(){
            $scope.user = {};
        };

        $scope.cancelLogin = function(){
            security.cancelLogin();
        };

    }]);
angular.module('security.login', ['security.login.form', 'security.login.toolbar']);
angular.module('security.login.toolbar',[])

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
                //调用所有的 onItemAdded callbacks
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

                            deferred.resolve(value);
                        }, function(value){

                            deferred.reject(value);
                        });
                    },
                    //reject未来的状态
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
    'security.retryQueue',  //跟踪失败的请求，在用户login后重试
    'security.login',       //含有登录时的表格模板和控制器
    'ui.bootstrap.dialog'   //利用弹出对话框形式展示登录表格
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

            //放弃重试，更新retry队列
            cancelLogin : function(){
                closeLoginDialog(false);
                redirect();
            },

            logout : function(redirectTo){
                $http.post('/logout').then(function(){
                    service.currentUser = null;
                    redirect(redirectTo);
                });
            },

            //获取当前的用户，可能存在于之前的session中
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

        //路由变化时更新面包屑导航

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

        //angularjs的provides必须要提供一些东西
        this.$get = angular.noop;

        //函数是定义服务的主要方式
        //用这个服务创造crud操作的路由.需要给定关于url和route的基本信息
        this.routesFor = function( resourceName, urlPrefix, routePrefix ){

            var baseUrl = resourceName.toLowerCase();
            var baseRoute = '/' + resourceName.toLowerCase();
            routePrefix = routePrefix || urlPrefix;

            if( angular.isString(urlPrefix) && urlPrefix !== "" ){
                baseUrl = urlPrefix + "/" + baseUrl;
            }

            if( routePrefix !== null &&  routePrefix !== undefined && routePrefix !== ""){
                baseRoute = '/' + routePrefix + baseRoute;
            }

            var templateUrl = function(operation){ //返回模板文件的名字
                return baseUrl + '/' + resourceName.toLowerCase() + '-' + operation.toLowerCase() + '.tpl.html';
            };

            var controllerName = function(operation){  //返回控制器的名字
                return resourceName + operation + 'Ctrl';
            };

            var routeBuilder = {

                //创建一个路由用于list items
                whenList : function(resolveFns){
                    routeBuilder.when(baseRoute,{
                        templateUrl : templateUrl('List'),
                        controller : controllerName('List'),
                        resolve : resolveFns
                    });
                    return routeBuilder;
                },
                //创建一个路由来创建item
                whenNew : function(resolveFns){
                    routeBuilder.when(baseRoute+'/new',{
                        templateUrl : templateUrl('Edit'),
                        controller : controllerName('Edit'),
                        resolve : resolveFns
                    });
                    return routeBuilder;
                },
                //创建一个路由来编辑已经存在的item
                whenEdit : function(resolveFns){
                    routeBuilder.when(baseRoute +'/:itemId',{
                        templateUrl : templateUrl('Edit'),  //少写了url这几个字
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

    crudRouteProvider.$injector = ['$routeProvider'];  //通过$injector注入依赖的服务

    angular.module('services.crudRouteProvider',['ngRoute']).provider('crudRoute',crudRouteProvider);  //注册模块


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

        var addNotification = function (notificationsArray, notificationObj) {
            if (!angular.isObject(notificationObj)) {
                throw new Error("Only object can be added to the notification service");
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

        notificationsService.pushForNextRoute = function(notification){  //push 写成put的错误
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
angular.module('templates.app', ['admin/projects/projects-edit.tpl.html', 'admin/projects/projects-list.tpl.html', 'admin/users/users-edit.tpl.html', 'admin/users/users-list.tpl.html', 'dashboard/dashboard.tpl.html', 'header.tpl.html', 'notifications.tpl.html', 'projects/productbacklog/productbacklog-edit.tpl.html', 'projects/productbacklog/productbacklog-list.tpl.html', 'projects/projects-list.tpl.html', 'projects/sprints/sprints-edit.tpl.html', 'projects/sprints/sprints-list.tpl.html', 'projects/sprints/tasks/tasks-edit.tpl.html', 'projects/sprints/tasks/tasks-list.tpl.html', 'projectsInfo/list.tpl.html']);

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

angular.module("dashboard/dashboard.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dashboard/dashboard.tpl.html",
    "<h4>我的项目</h4>\n" +
    "<div ng-include=\"'projects/projects-list.tpl.html'\"></div>\n" +
    "\n" +
    "<h4>我的任务</h4>\n" +
    "<table class=\"table table-bordered table-condensed table-striped table-hover\">\n" +
    "    <thead>\n" +
    "        <tr>\n" +
    "            <th class=\"span8\">任务名</th>\n" +
    "            <th class=\"span1\">任务评估</th>\n" +
    "            <th class=\"span1\">保留</th>\n" +
    "            <th class=\"span2\">工具</th>\n" +
    "        </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "        <tr ng-repeat=\"task in tasks\">\n" +
    "            <td>{{task.name}}</td>\n" +
    "            <td>{{task.estimation}}</td>\n" +
    "            <td>{{task.remaining}}</td>\n" +
    "            <td></td>\n" +
    "        </tr>\n" +
    "        <tr ng-show=\"!tasks.length\">\n" +
    "            <td colspan=\"4\">尚没有任务分配给你</td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>");
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
    "        <tr ng-show=\"!backlog.length\">\n" +
    "            <td colspan=\"4\">待办列表中尚无条目</td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>\n" +
    "<div class=\"well\">\n" +
    "    <button class=\"btn\" ng-click=\"new()\">新建待办条目</button>\n" +
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

angular.module("projects/sprints/sprints-edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projects/sprints/sprints-edit.tpl.html",
    "<div class=\"well\">\n" +
    "    <h4>冲刺</h4>\n" +
    "    <hr>\n" +
    "    <form name=\"form\" crud-edit=\"sprint\">\n" +
    "        <div class=\"row-fluid\">\n" +
    "            <div class=\"span6\">\n" +
    "                <label>冲刺名称</label>\n" +
    "                <input type=\"text\" name=\"name\" ng-model=\"sprint.name\" class=\"span10\" required autofocus>\n" +
    "                <label>容量</label>\n" +
    "                <input type=\"number\" name=\"description\" ng-model=\"sprint.capacity\" class=\"span5\" required>\n" +
    "            </div>\n" +
    "            <div class=\"span6\">\n" +
    "                <label>起始日期</label>\n" +
    "                <input type=\"text\" name=\"name\" ng-model=\"sprint.start\" class=\"span5\" required>\n" +
    "                <label>终止日期</label>\n" +
    "                <input type=\"text\" name=\"name\" ng-model=\"sprint.end\" class=\"span5\" required>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <hr>\n" +
    "        <h4>冲刺待办列表</h4>\n" +
    "        <hr>\n" +
    "        <div class=\"row-fluid\">\n" +
    "            <div class=\"span6\">\n" +
    "                <label>目前在冲刺上的待办列表</label>\n" +
    "                <table class=\"table table-bordered table-condensed table-striped table-hover\">\n" +
    "                    <thead>\n" +
    "                    <tr>\n" +
    "                        <th class=\"span8\">名称</th>\n" +
    "                        <th class=\"span2\">评估</th>\n" +
    "                        <th class=\"span2\">工具</th>\n" +
    "                    </tr>\n" +
    "                    </thead>\n" +
    "                    <tbody>\n" +
    "                    <tr ng-repeat=\"sprintBacklogItem in sprint.sprintBacklog\">\n" +
    "                        <td><a ng-click=\"viewProductBacklogItem(sprintBacklogItem)\">{{productBacklogLookup[sprintBacklogItem].name}}</a>\n" +
    "                        </td>\n" +
    "                        <td>{{productBacklogLookup[sprintBacklogItem].estimation}}</td>\n" +
    "                        <td>\n" +
    "                            <button class=\"btn btn-mini btn-danger\" ng-click=\"removeBacklogItem(sprintBacklogItem)\">\n" +
    "                                删除\n" +
    "                            </button>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                    </tbody>\n" +
    "                    <tfoot>\n" +
    "                    <tr>\n" +
    "                        <td>总体评估</td>\n" +
    "                        <td>{{estimationInTotal()}}</td>\n" +
    "                        <td>-</td>\n" +
    "                    </tr>\n" +
    "                    </tfoot>\n" +
    "                </table>\n" +
    "            </div>\n" +
    "            <div class=\"span6\">\n" +
    "                <label>产品待办列表</label>\n" +
    "                <table class=\"table table-bordered table-condensed table-striped table-hover\">\n" +
    "                    <thead>\n" +
    "                    <tr>\n" +
    "                        <th class=\"span8\">名称</th>\n" +
    "                        <th class=\"span2\">评估</th>\n" +
    "                        <th class=\"span2\">工具</th>\n" +
    "                    </tr>\n" +
    "                    </thead>\n" +
    "                    <tbody>\n" +
    "                    <tr ng-repeat=\"productBacklogItem in productBacklog | filter:notSelected\">\n" +
    "                        <td>\n" +
    "                            <a ng-click=\"viewProductBacklogItem(productBacklogItem.$id())\">{{productBacklogItem.name}}</a>\n" +
    "                        </td>\n" +
    "                        <td>{{productBacklogItem.estimation}}</td>\n" +
    "                        <td>\n" +
    "                            <button class=\"btn btn-mini\" ng-click=\"addBacklogItem(productBacklogItem)\">添加到冲刺\n" +
    "                            </button>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                    </tbody>\n" +
    "                </table>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <hr>\n" +
    "        <div>\n" +
    "            <crud-buttons></crud-buttons>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "</div>");
}]);

angular.module("projects/sprints/sprints-list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("projects/sprints/sprints-list.tpl.html",
    "<table class=\"table table-bordered table-condensed table-striped table-hover\">\n" +
    "    <thead>\n" +
    "    <tr>\n" +
    "        <th>冲刺名称</th>\n" +
    "        <th>起始日期</th>\n" +
    "        <th>终止日期</th>\n" +
    "        <th>状态</th>\n" +
    "        <th>工具</th>\n" +
    "    </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "    <tr ng-repeat=\"sprint in sprints\">\n" +
    "        <td ng-click=\"edit(sprint.$id())\">{{sprint.name}}</td>\n" +
    "        <td ng-click=\"edit(sprint.$id())\">{{sprint.start}}</td>\n" +
    "        <td ng-click=\"edit(sprint.$id())\">{{sprint.end}}</td>\n" +
    "        <td ng-click=\"edit(sprint.$id())\">激活</td>\n" +
    "        <td>\n" +
    "            <button type=\"button\" class=\"btn btn-mini\" ng-click=\"tasks(sprint)\">任务</button>\n" +
    "        </td>\n" +
    "    </tr>\n" +
    "    <tr ng-show=\"!sprints.length\">\n" +
    "        <td colspan=\"5\">尚无冲刺定义</td>\n" +
    "    </tr>\n" +
    "    </tbody>\n" +
    "</table>\n" +
    "<div class=\"well\">\n" +
    "    <button class=\"btn\" ng-click=\"new()\">新建冲刺</button>\n" +
    "</div>");
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
