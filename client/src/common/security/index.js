//通过这种形式，合并各个模块，然后各个模块间的服务也可以相互引用
angular.module('security',[
    'security.service',
    'security.interceptor',
    'security.login',
    'security.authorization'
]);