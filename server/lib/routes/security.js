exports.addRoutes = function(app, security){

    app.post('/login',security.login);
    app.post('/logout',security.logout);

    //retrieve the current user
    app.get('/current-user',security.sendCurrentUser);

    //retrieve the current user only if they are authenticated
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