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