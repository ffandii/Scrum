angular.module('security.login.toolbar',[])

//the login toolToolbar directive is a reusable widget that can show login or logout button
//and information the current authenticated user

.directive('loginToolbar', ['security', function(security){

       var directive = {
           templateUrl : "security/login/toolbar.tpl.html",
           restrict : "E",
           replace : true,
           scope : true,  //继承自己的父作用域还是创建一个独立的作用域
           link : function($scope, $element, $attrs, $controller){
               $scope.isAuthenticated = security.isAuthenticated;
               $scope.login = security.showLogin;
               $scope.logout = security.logout;
               $scope.$watch(function(){
                   return security.currentUser;
               }, function( currentUser ){
                   $scope.currentUser = currentUser;
               });
           }

       };

    }]);