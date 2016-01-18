angular.module('resources.users',['mongolabResource']);

angular.module('resources.users').factory('Users',['mongolabResource', function(mongolabResource){

    var userResource = mongolabResource('users');

    userResource.prototype.getFullName = function(){
        return this.lastName + " " + this.firstName + " ( "+this.email+ " )";
    };

    return userResource;

}]);