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

