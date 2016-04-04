var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey = fs.readFileSync(__dirname + '/cert/privatekey.pem').toString();
var certificate = fs.readFileSync(__dirname + '/cert/certificate.pem').toString();
var credentials = { key: privateKey, cert : certificate };

var express = require('express');
var mongoProxy = require('./lib/mongo-proxy'); //和mongolab交互时的代理
var config = require('./config');
var passport = require('passport');  //nodejs中做登录验证的中间件
var security = require('./lib/security');
var xsrf = require('./lib/xsrf');  // XSRF / CSRF 跨站请求伪造
var protectJSON = require('./lib/protectJSON');  //防止json注入攻击

require('express-namespace');

var app = express();
var secureServer = https.createServer(credentials, app);
var server = http.createServer(app);

require('./lib/routes/static').addRoutes(app,config); //配置静态文件的路由 express.static

app.use(protectJSON);

app.use(express.logger());  //在控制台记录请求
app.use(express.bodyParser());  //解析请求体中的数据
app.use(express.cookieParser(config.server.cookieSecret));  //cookieSecret用于加密cookie
app.use(express.cookieSession());
app.use(passport.initialize());  //passport初始化
app.use(passport.session());     //用开启session管理用户
app.use(xsrf);
security.initialize(config.mongo.dbUrl,config.mongo.apiKey,config.security.dbName,config.security.usersCollection);

app.use(function(req, res, next){
    if(req.user){
        console.log('Current User: ',req.user.firstName,req.user.lastName);
    } else {
        console.log('unauthenticated.');
    }
    next();
});

app.namespace('/databases/:db/collections/:collection*',function(){
    app.all('/',function(req,res,next){
        if(req.method !== 'GET'){
            //非get请求时用户需要被authenticated
            security.authenticationRequired(req, res, next);
        } else {
            next();
        }
    });

    app.all('/',function(req, res, next){
        if(req.method !== 'GET' && (req.params.collection === 'users' || req.params.collection === 'projects')){
            //对users或projects集合进行非get操作时，用户需要被admin
            return security.adminRequired(req, res, next);
        }
        next();
    });
    //代理客户端和mongolab的交互
    app.all('/',mongoProxy(config.mongo.dbUrl,config.mongo.apiKey));
});

require('./lib/routes/security').addRoutes(app,security);  //定义与mongolab交互时的路由
require('./lib/routes/appFile').addRoutes(app,config);  //对/*请求发送index.html，这样来处理单页面内的路由

//express中一个标准的错误句柄 --- 捕获遗漏的错误，返回500错误
app.use(express.errorHandler({dumpExceprions: true, showStack: true}));

//开启服务器
server.listen(config.server.listenPort,'0.0.0.0',511,function(){
    var open = require('open');
    open('http://localhost:'+config.server.listenPort+'/');
});

console.log('Scrum server - listen on port: ' + config.server.listenPort);

secureServer.listen(config.server.securePort);

console.log('Scrum server - listen on secure port: ' + config.server.securePort);