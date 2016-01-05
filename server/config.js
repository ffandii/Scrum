var path = require('path');

module.exports = {

    mongo: {
        dbUrl: "https://api.mongolab.com/api/1",  //the base url of the mongolab db server
        apiKey: "4qKO9Qp3Y01ZopKm4Zf7wJSZ-8qLksKZ"  //our mongolab api key
    },

    security: {
        dbName: "ffandii",  //the name of database that contains the security information
        usersCollection: "users"  //the name of the collection that contains the user information
    },

    server: {
        listenPort: 3000,  //the port on which the server is to listen
        securePort: 8433,  //the https port on which the serve is to listen
        disFolder: path.resolve(__dirname,'../client/dist'),  //the folder that contains the application file
        staticUrl: '/static',  //base url in which we serve static files
        cookieSecret: "Scrum"  //the secret for encrypting the cookie
    }

};