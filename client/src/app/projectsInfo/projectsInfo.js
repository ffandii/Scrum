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