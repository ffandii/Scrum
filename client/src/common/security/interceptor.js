//注入$httpProvider服务的响应拦截器
angular.module('security.interceptor', ['security.retryQueue'])

//this http interceptor listens for authentication failures

    .factory('securityInterceptor',['$injector','securityRetryQueue',function($injector,queue){

        return function(promise){

            //intercept failed requests
            return promise.then(null, function( originalResponse ){

                if( originalResponse.status === 401 ){
                    promise = queue.pushRetryFn('unauthorized-server', function retryRequest(){
                        //we must use $inject to get the $http service to prevent circular dependency
                        return $injector.get('$http')(originalResponse.config);

                    });
                }

                return promise;

            });

        };

    }])

.config(['$httpProvider',function($httpProvider){

        $httpProvider.responseInterceptors.push('securityInterceptor');

    }]);

