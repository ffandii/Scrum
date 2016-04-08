//based loosely around work by Witold Szczerba
angular.module('security.service',[
    'security.retryQueue',  //跟踪失败的请求，在用户login后重试
    'security.login',       //含有登录时的表格模板和控制器
    'ui.bootstrap.dialog'   //利用弹出对话框形式展示登录表格
])

.factory('security', ['$http', '$q', '$location', 'securityRetryQueue', '$dialog', function( $http, $q, $location, queue, $dialog ){

        //redirect to the given url( default '/' )
        function redirect(url){
            url = url || '/';
            $location.path(url);
        }

        //login form dialog stuff
        var loginDialog = null;
        function openLoginDialog(){
            if( loginDialog ){
                throw new Error('Trying to open a dialog that is already open...');
            }
            loginDialog = $dialog.dialog();
            loginDialog.open('security/login/form.tpl.html', 'LoginFormController').then(onLoginDialogClose);
        }

        function closeLoginDialog(success){

            if( loginDialog ){
                loginDialog.close(success);
            }

        }

        function onLoginDialogClose(success){

            loginDialog = null;
            if(success){
                queue.retryAll();
            } else {
                queue.cancelAll();
                redirect();
            }

        }

        //register a handler for when an item is added to the retry queue
        queue.onItemAddedCallbacks.push(function(retryItem){
            if(queue.hasMore()){
                service.showLogin();
            }
        });

        var service = {

            getLoginReason : function(){
                return queue.retryReason();
            },

            showLogin : function(){
                openLoginDialog();
            },

            //attempt to authenticate a user by the given email and password
            login : function( email, password ){

                var request = $http.post('/login', { email : email, password : password });
                return request.then(function(response){
                    service.currentUser = response.data.user;
                    if(service.isAuthenticated()){
                        closeLoginDialog(true);
                    }
                    return service.isAuthenticated();
                });

            },

            //放弃重试，更新retry队列
            cancelLogin : function(){
                closeLoginDialog(false);
                redirect();
            },

            logout : function(redirectTo){
                $http.post('/logout').then(function(){
                    service.currentUser = null;
                    redirect(redirectTo);
                });
            },

            //获取当前的用户，可能存在于之前的session中
            requestCurrentUser : function(){
                if(service.isAuthenticated()){
                    return $q.when(service.currentUser);  //传值服务
                } else {
                    return $http.get('/current-user').then(function(response){  //这里把路由写错了
                        service.currentUser = response.data.user;
                        return service.currentUser;
                    });
                }
            },

            currentUser : null,

            isAuthenticated : function(){
                return !!service.currentUser;  //currentUser
            },

            isAdmin : function(){
                return !!(service.currentUser && service.currentUser.admin);
            }

        };

        return service;

    }]);