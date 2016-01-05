var rest = require('request');

var initDB = {
    adminUser: {
        email: "1262623665@qq.com",
        password: "fc4290041992",
        admin: true,
        firstName: "ffandii",
        lastName: "user"
    },

    initialize: function(config){
        initDB.apiKey = config.mongo.apiKey;
        initDB.baseUrl = config.mongo.dbUrl + '/databases/' + config.security.dbName + '/collections/';
        initDB.usersCollection = config.security.usersCollection;
    },

    checkDocument: function(collection, query, done){
        var url = initDB.baseUrl + collection + "/";
        console.log("Request.get - " + url);
        var params = {
            apiKey: initDB.apiKey,
            q: JSON.stringify(query)
        };
        var request = rest.get(url, { qs : params, json : {} }, function( err, response, data ){
            if( err ){
                console.log("There was one error in getting the document", err);
            }
            done(err, data);
        });
    },

    createDocument: function( collection, doc, done ){
        var url = initDB.baseUrl + collection + "/";
        console.log("Request.post - " + url);
        var request = rest.post( url, { qs : {apiKey: initDB.apiKey}, json : doc }, function( err, response, data ){
            if( !err ){
                console.log("Document created", data);
            }

            done(err, data);

        });
    },

    deleteDocument: function( collection, docId, done ){
        var url = initDB.baseUrl + collection + "/" + docId;
        console.log("Request.delete - " +url);
        var request = rest.del(url, { qs: { apiKey : initDB.apiKey }, json : {} }, function( err, response, data ){
            if( !err ){
                console.log('Document.deleted', data);
            }

            done(err, data);
        });
    },

    addAdminUser: function( done ){
        console.log("*** Admin user properties: ", initDB.adminUser);
        console.log("Checking that adminUser doesn't exist...");
        initDB.checkDocument( initDB.usersCollection, initDB.adminUser, function( err, data ){
            if( !err && data.length === 0 ){
                console.log( "Creating new admin user...", err, data );
                initDB.createDocument( initDB.usersCollection, initDB.adminUser, function( err, data ){
                    console.log(err);
                    console.log(data);
                    done( err, data );
                });
            } else {
                if( data.message ){
                    console.log("Error: ", data.message);
                } else {
                    console.log("User already created... ");
                }
                done( err, data );
            }
        });
    }
};

module.exports = initDB;