var url = require('url');
var qs = require('querystring');
var https = require("https");

module.exports = function( basePath, apiKey ){

    console.log("Proxying mongolab at ",basePath,'with',apiKey);

    basePath = url.parse(basePath);  //解析为json对象

    //向服务器端的url映射到mongolab上的url
    var mapUrl = module.exports.mapUrl = function(reqUrlString){
        var reqUrl = url.parse(reqUrlString,true);
        var newUrl = {
            hostname: basePath.hostname,
            protocol: basePath.protocol
        };
        var query = {apiKey: apiKey};
        for(var key in reqUrl.query){
            query[key] = reqUrl.query[key];
        }

        newUrl.path = basePath.pathname + reqUrl.pathname + "?" + qs.stringify(query);

        return newUrl;
    };

    //Map the incoming request to a request to the DB
    var mapRequest = module.exports.mapRequest = function(req){
        var newReq = mapUrl(req.url);
        newReq.method = req.method;
        newReq.headers = req.headers || {};
        //we need to fix up the hostname
        newReq.headers.host = newReq.hostname;

        return newReq;
    };

    var proxy = function( req, res, next ){

        try {
            var options = mapRequest(req);
            //创建发往mongolab端的请求
            var dbReq = https.request(options,function(dbRes){
                var data = "";
                res.headers = dbRes.headers;
                dbRes.setEncoding('utf8');
                dbRes.on("data",function(chunk){
                    data = data + chunk;
                });
                dbRes.on("end",function(){
                    res.header('Content-Type','application/json');
                    res.statusCode = dbRes.statusCode;
                    res.httpVersion = dbRes.httpVersion;
                    res.trailers = dbRes.trailers;
                    res.send(data);  //置完请求头后接下来就是发送数据
                    res.end();
                });
            });
            dbReq.end(JSON.stringify(req.body));  //发送请求体
        } catch( error ){
            console.log("ERROR: " + error.stack);
            res.json(error);
            res.end();
        }
    };

    proxy.mapUrl = mapUrl;
    proxy.mapRequest = mapRequest;

    return proxy;

};