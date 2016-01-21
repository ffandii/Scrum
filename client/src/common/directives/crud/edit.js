angular.module('directives.crud.edit', [])

//apply this directive to an element at or below a form that will manage crud operations on a resource
//the resource must expose the following instance methods: $saveOrUpdate() $id() and $remove()

.directive('crudEdit', ['$parse', function($parse){

        return {

            scope : true,
            require : "^form",
            //this directive can only appear as an attribute
            link : function(scope,element,attrs,form){

                var resourceGetter = $parse(attrs.crudEdit);
                var resourceSetter = resourceGetter.assign;
                //store the object for easy access
                var resource = resourceGetter(scope);
                var original = angular.copy(resource);

                var checkResourceMethod = function(methodName){
                    if(!angular.isFunction(resource[methodName])){
                        throw new Error('crudEdit directive: the resource must expose the '+methodName+'() instance method');
                    }
                };

                checkResourceMethod('$saveOrUpdate');
                checkResourceMethod('$id');
                checkResourceMethod('$remove');

                //该功能可以帮助我们从指令属性中提取命令函数
                var makeFn = function(attrName){
                    var fn = scope.$eval(attrs[attrName]);
                    if(!angular.isFunction(fn)){
                        throw new Error('crudEdit directive: the attribute '+attrName+" must evaluate to a function");
                    }
                    return fn;
                };

                //set up callbacks with fallback
                var userOnSave = attrs.onSave?makeFn('onSave'):(scope.onSave||angular.noop);
                var onSave = function(result, status, headers, config){
                    original = result;
                    userOnSave(result, status, headers, config);
                };

                var onRemove = attrs.onRemove?makeFn('onRemove'):(scope.onRemove || onSave);
                var onError = attrs.onError?makeFn('onError'):(scope.onError||angular.noop);

                scope.save = function(){
                    resource.$saveOrUpdate(onSave,onSave,onError,onError);
                };

                scope.revertChanges = function(){
                    resource = angular.copy(original);
                    resourceSetter(scope, resource);
                    form.$setPristine();
                };

                scope.remove = function(){
                    if(resource.$id()){
                        resource.$remove(onRemove, onError);
                    } else {
                        onRemove();
                    }
                };

                scope.canSave = function(){
                    return form.$valid && !angular.equals(resource, original);
                };

                scope.canRevert = function(){
                    return !angular.equals(resource, original);
                };

                scope.canRemove = function(){
                    return resource.$id();
                };

                scope.getCssClasses = function(fieldName){
                    var ngModelController = form[fieldName];
                    return {
                        error : ngModelController.$invalid && !angular.equals(resource, original),
                        success : ngModelController.$valid && !angular.equals(resource, original)
                    };
                };

                scope.showError = function(fieldName, error) {
                    return form[fieldName].$error[error];
                };
            }

        };

    }]);