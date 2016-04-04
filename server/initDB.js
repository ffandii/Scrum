var config = require( './config' );
var initDB = require( './lib/initDB' );
console.log("Configuration: \n", config);

initDB.initialize(config);

initDB.addAdminUser(function(){  // 初始化数据库的管理员
});