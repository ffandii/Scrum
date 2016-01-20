angular.module('directives.crud.edit', [])

//apply this directive to an element at or below a form that will manage crud operations on a resource
//the resource must expose the following instance methods: $saveOrUpdate() $id() and $remove()

.directive('crudEdit', ['$parse', function($parse){

        return {

        };

    }]);