var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey = fs.readFileSync(__dirname + '/cert/privatekey.pem').toString();
var certificate = fs.readFileSync(__dirname + '/cert/certificate.pem').toString();
var credentials = { key: privateKey, cert : certificate };

var express = require('express');
var mongoProxy = require('./lib/mongo-proxy');
var config = require('./config');
var passport = require('passport');
var security = require('./lib/security');
var xsrf = require('./lib/xsrf');
var protectJSON = require('./lib/protectJSON');

require('express-namespace');

var app = express();
var secureServer = https.createServer(credentials, app);
var server = http.createServer(app);

require('./lib/routes/static').addRoutes(app,config);

app.use(protectJSON);

app.use(express.logger());  //log request to the console
app.use(express.bodyParser());  //extract data from the body of the request
app.use(express.cookieParser(config.server.cookieSecret));
app.use(express.cookieSession());
app.use(passport.initialize());
app.use(passport.session());
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
            //we require the user to be authenticated to modify any collections
            security.authenticationRequired(req, res, next);
        } else {
            next();
        }
    });

    app.all('/',function(req, res, next){
        if(req.method !== 'GET' && (req.params.collection === 'users' || req.params.collection === 'projects')){
            //we require the current user to be a admin to modify any collection
            return security.adminRequired(req, res, next);
        }
        next();
    });
    //proxy database calls to mongodb
    app.all('/',mongoProxy(config.mongo.dbUrl,config.mongo.apiKey));
});

require('./lib/routes/security').addRoutes(app,security);
require('./lib/routes/appFile').addRoutes(app,config);

//a standard error handler --- it picks up any left over errors and returns a nicely formatted 500 error
app.use(express.errorHandler({dumpExceprions: true, showStack: true}));

//start up the server on the specified port in the config
server.listen(config.server.listenPort,'0.0.0.0',511,function(){
    var open = require('open');
    open('http://localhost:'+config.server.listenPort+'/');
});

console.log('Scrum server - listen on port: ' + config.server.listenPort);

secureServer.listen(config.server.securePort);

console.log('Scrum server - listen on secure port: ' + config.server.securePort);
