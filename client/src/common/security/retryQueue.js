angular.module('security.retryQueue', [])

//this is a generic retry queue for security failures. Each item is expected to expose to functions: retry and cancel
.factory('securityRetryQueue', ['$q', '$log', function($q, $log){

        var retryQueue = [];
        var service = {
            //the security service put its own handler in here
            onItemAddedCallbacks : [],

            hasMore : function(){
                return retryQueue.length > 0;
            },

            push : function( retryItem ) {
                retryQueue.push( retryItem );
                //调用所有的 onItemAdded callbacks
                angular.forEach( service.onItemAddedCallbacks, function( cb ){
                    try {
                        cb( retryItem );
                    } catch( e ){
                        $log.error('securityRetryQueue.push(retryItem): callback threw an error: '+ e);
                    }
                });
            },

            pushRetryFn : function( reason, retryFn ){

                //reason参数可选
                if( arguments.length === 1 ){
                    retryFn = reason;
                    reason = undefined;
                }

                var deferred = $q.defer();
                var retryItem = {
                    reason : reason,
                    retry : function(){

                        $q.when(retryFn()).then(function(value){
                            deferred.resolve(value);
                        }, function(value){
                            deferred.reject(value);
                        });

                    },
                    //reject未来的状态
                    cancel : function(){
                        deferred.reject();
                    }
                };
                service.push(retryItem);
                return deferred.promise;
            },

            retryReason : function(){
                return service.hasMore() && retryQueue[0].reason;
            },

            cancelAll : function(){
                while(service.hasMore()){
                    retryQueue.shift().cancel();
                }
            },

            retryAll : function(){
                while(service.hasMore()){
                    retryQueue.shift().retry();  //shift没有写成一个函数，导致错误
                }
            }

        };

        return service;

    }]);