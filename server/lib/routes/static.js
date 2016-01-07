var express = require('express');

exports.addRoutes = function(app, config){
    //serve up the favicon
    app.use(express.favicon(config.server.disFolder + '/favicon'));

    //first looks for a static file, index.html images, css, etc.
    app.use(config.server.staticUrl, express.compress());
    app.use(config.server.staticUrl, express.static(config.server.disFolder));
    app.user(config.server.staticUrl, function(req,res,next){
        res.send(404);  //if we get here then the request for the static resource is invalid
    });
};