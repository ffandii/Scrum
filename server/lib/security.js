var express = require('express');
var passport = require('passport');
var MongoStrategy = require('./mongo-strategy');
var app = express();

var filterUser = function(user){
    if( user ){
        return {
            user : {
                id : user._id.$oid,
                email : user.email,
                firstName : user.firstName,
                lastName : user.lastName,
                admin : user.admin
            }
        };
    } else {
        return {
            user : null
        };
    }
};

var security = {
    initialize : function( url, apiKey, dbName, authCollection ){
        passport.use( new MongoStrategy( url, apiKey, dbName, authCollection ));
    },
    authenticationRequired : function( req, res, next ){
        console.log('authRequired');
        if(req.isAuthenticated()){
            next();
        } else {
            res.json(401, filterUser(req.user));
        }
    },
    adminRequired: function(req, res, next){
        console.log("adminRequired");
        if( req.user && req.user.admin ){
            next();
        } else {
            req.json(401, filterUser(req.user));
        }
    },

    sendCurrentUser : function( req,res,next ){
        res.json(200, filterUser(req.user));
        res.end();
    },
    login: function(req,res,next){
        function authenticationFailed (error, user, info){
            if(error) {
                return next(error);
            }
            if(!user){
                return res.json(filterUser(user));
            }
            req.login(user, function(error){
                if( error ){
                    return next(error);
                }
                return res.json(filterUser(user));
            });
        }
        return passport.authenticate(MongoStrategy.name,authenticationFailed)(req,res,next);
    },
    logout: function(req,res,next){
        req.logout();
        req.send(204);
    }
};

module.exports = security;