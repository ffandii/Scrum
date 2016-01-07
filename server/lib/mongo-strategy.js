var util = require('util');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var rest = require('rest');

function MongoDBStrategy(dbUrl, apiKey, dbName, collection){
    this.dbUrl = dbUrl;
    this.apiKey = apiKey;
    this.dbName = dbName;
    this.baseUrl = this.dbUrl + '/databases' + this.dbName + '/collections' + '/' + collection +'/';

    //call the super constructor  -  passing in our user verification function
    //we use the email field for the username
    LocalStrategy.call(this, { usernameField: 'email' }, this.verifyUser.bind(this));

    //serialize the user into a string for storing in the session
    passport.serializeUser(function(user,done){
        done(null,user._id.$oid);  //remember that mongodb has that weird structure
    });

    //Deserialize the string into a user
    passport.deserializeUser(this.get.bind(this));

    this.name = MongoDBStrategy.name;

}

//MongoStrategy inherits from the LocalStrategy
util.inherits(MongoDBStrategy,LocalStrategy);

MongoDBStrategy.name = "mongo";

//Get a user by id
MongoDBStrategy.prototype.get = function(id, done){
    var query = {apiKey: this.apiKey};
    var request = rest.get(this.baseUrl + id,{ qs: query, json: {} }, function( error, response, body ){
        done( error, body );
    });
};

//find a user by their email
MongoDBStrategy.prototype.findByEmail = function(email, done){
    this.query({ q : JSON.stringify({ email: email }) }, function( error, result ){
        if( result && result.length === 1 ){
            return done( error, result[0] );
        }
        done(error,null);
    });
};

//Check whether the user passed in is a valid one
MongoDBStrategy.prototype.verifyUser = function( email, password, done ){
    this.findByEmail(function( error, user ){
        if( !error && user ){
            if( user.password !== password ){
                user = null;
            }
        }
        done(error, user);
    });
};

module.exports = MongoDBStrategy;