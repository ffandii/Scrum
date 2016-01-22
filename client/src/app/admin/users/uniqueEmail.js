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