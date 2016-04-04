var express = require('express');

exports.addRoutes = function(app, config){
    //网站的favicon
    app.use(express.favicon(config.server.disFolder + '/favicon.ico'));

    //首先查找一个静态的文件, index.html images, css等.
    app.use(config.server.staticUrl, express.compress());
    app.use(config.server.staticUrl, express.static(config.server.disFolder));
    app.use(config.server.staticUrl, function(req,res,next){
        res.send(404);  //如果没有查找到相应的静态文件，则返回一个404的错误
    });
};