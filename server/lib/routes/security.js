exports.addRoutes = function(app, security){

    app.post('/login',security.login);
    app.post('/logout',security.logout);

    //获取当前用户
    app.get('/current-user',security.sendCurrentUser);

    //获取authenticated-user 或者 admin-user
    app.get('/authenticated-user', function(req, res){
        security.authenticationRequired(req, res, function(){
            security.sendCurrentUser(req, res);
        })
    });

    app.get('/admin-user', function(req, res){
        security.adminRequired(req, res, function(){
            security.sendCurrentUser(req, res);
        });
    });

};