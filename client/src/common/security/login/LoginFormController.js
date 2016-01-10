angular.module('security.login.form', ['services.localizedMessages'])

    .controller('LoginFormController', ['$scope', 'localizedMessages', function( $scope, localizedMessages ){

        //the modal for the form
        $scope.user = {};

        //any error message from failing to login
        $scope.authError = null;

        //the reason that we are being asked to login, for instance , because we tried to access something to which we are not authorized now
        $scope.authReason = localizedMessages.get('login.reason.notAuthorized');

    }]);