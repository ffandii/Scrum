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


            $scope.clearForm = function(){
                $scope.user = {};
            };

            $scope.cancelLogin = function(){
                security.cancelLogin();
            };
        };

    }]);