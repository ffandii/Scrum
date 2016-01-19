angular.module('services.crud', ['services.crudRouteProvider']);

angular.module('services.crud').factory('crudEditMethods',function(){

    return function(itemName, item, formName, successcb, errorcb){

        var mixin = {};

        mixin[itemName] = item;
        mixin[itemName+'Copy'] = angular.copy(item);

        mixin.save=  function(){
            this[itemName].$saveOrUpdate(successcb, successcb, errorcb, errorcb);
        };

        mixin.canSave = function(){
            return this[formName].$valid && !angular.equals(this[itemName], this[itemName+'Copy']);
        };

        mixin.revertChanges = function(){
            this[itemName] = angular.copy(this[itemName+'Copy']);
        };

        mixin.canRevert = function(){
            return !angular.equals(this[itemName],this[itemName+'Copy']);
        };

        mixin.remove = function(){
            if(this[itemName].$id()){
                this[itemName].$remove(successcb, errorcb);
            } else {
                successcb();
            }
        };

        mixin.canRemove = function(){
            return item.$id();
        };

        mixin.getCssClasses = function(fieldName){
            var ngModelController = this[formName][fieldName];
            return {
                error : ngModelController.$invalid && ngModelController.$dirty,
                success : ngModelController.$valid && ngModelController.$dirty
            };
        };

        mixin.showError = function(fieldName, error) {
            return this[formName][fieldName].$error[error];
        };

        return mixin;

    };

});

angular.module('services.crud').factory('crudListMethods',['$location',function($location){

    return function(pathPrefix){

        var mixin = {};

        mixin['new'] = function(){
            $location.path(pathPrefix + '/new');
        };

        mixin['edit'] = function(itemId){
            $location.path(pathPrefix +'/'+itemId);
        };

        return mixin;

    };

}]);