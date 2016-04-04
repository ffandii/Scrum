var util = require('util');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var rest = require('request');

function MongoDBStrategy(dbUrl, apiKey, dbName, collection) {
    this.dbUrl = dbUrl;
    this.apiKey = apiKey;
    this.dbName = dbName;
    this.collection = collection;
    this.baseUrl = this.dbUrl + '/databases/' + this.dbName + '/collections/' + collection + '/';

    // Call the super constructor - passing in our user verification function
    // 使用email作为登录时的username
    LocalStrategy.call(this, { usernameField: 'email' }, this.verifyUser.bind(this));

    //序列化用户为一个id存储在session中
    passport.serializeUser(function(user, done) {
        done(null, user._id.$oid); //记住mongodb有这样的结构 { _id: { $oid: 1234567 } }
    });

    // 通过一个string(id) 对用户反序列化为一个user对象 (通过一个发向DB的请求)
    passport.deserializeUser(this.get.bind(this));

    this.name = MongoDBStrategy.name;
}

// MongoDBStrategy 继承自 LocalStrategy 拥有其方法
util.inherits(MongoDBStrategy, LocalStrategy);

MongoDBStrategy.name = "mongo";

// 查询users集合
MongoDBStrategy.prototype.query = function(query, done) {
    query.apiKey = this.apiKey;     // Add the apiKey to the passed in query
    var request = rest.get(this.baseUrl, { qs: query, json: {} }, function(err, response, body) {
        done(err, body);
    });
};

// 通过id获取用户  用于反序列化
MongoDBStrategy.prototype.get = function(id, done) {
    var query = { apiKey: this.apiKey };
    var request = rest.get(this.baseUrl + id, { qs: query, json: {} }, function(err, response, body) {
        done(err, body);
    });
};

// 通过email查询一个用户
MongoDBStrategy.prototype.findByEmail = function(email, done) {
    this.query({ q: JSON.stringify({email: email}) }, function(err, result) {
        if ( result && result.length === 1 ) {
            return done(err, result[0]);
        }
        done(err, null);
    });
};

// 检查user是否有效
MongoDBStrategy.prototype.verifyUser = function(email, password, done) {
    this.findByEmail(email, function(err, user) {
        if (!err && user) {
            if (user.password !== password) {
                user = null;
            }
        }
        done(err, user);
    });
};

module.exports = MongoDBStrategy;