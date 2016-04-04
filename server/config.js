var path = require('path');

module.exports = {

    mongo: {
        dbUrl: "https://api.mongolab.com/api/1",  //mongolab端的基本url
        apiKey: "4qKO9Qp3Y01ZopKm4Zf7wJSZ-8qLksKZ"  //在mongolab上建立数据库的apikey
    },

    security: {
        dbName: "ffandii",  //数据库名
        usersCollection: "users"  //开发人员的集合
    },

    server: {
        listenPort: 3000,  //服务器端监听的http端口
        securePort: 8433,  //服务器端监听的https端口
        disFolder: path.resolve(__dirname,'../client/dist'),  //生产部署时的目录
        staticUrl: '/static',  //处理静态文件时的请求路径
        cookieSecret: "Scrum"  //用于cookie加密
    }

};