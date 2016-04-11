angular.module('directives.crud.edit', [])

//把这样一个指令添加到form元素或者其内， 将会管理资源上的crud操作
//资源必须暴露以下这些方法: $saveOrUpdate() $id() and $remove()

.directive('crudEdit', ['$parse', function($parse){

        return {

            scope : true,
            require : "^form",  //设置要注入当前指令链接函数中的其他指令的控制器
            //这个指令只能作为一个属性出现
            link : function(scope,element,attrs,form){  //link用来将作用域与指令链接起来

                var resourceGetter = $parse(attrs.crudEdit);  //获取的对象
                var resourceSetter = resourceGetter.assign;   //用于设置该对象
                //store the object for easy access
                var resource = resourceGetter(scope);  //整个scope作用域中包含的资源
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
                    var fn = scope.$eval(attrs[attrName]);  //引入需要的函数
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