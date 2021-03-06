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