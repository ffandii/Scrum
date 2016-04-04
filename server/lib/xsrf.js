var crypto = require("crypto");

function uid(len){
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')
        .slice(0, len)
        .replace(/\//g, '-')
        .replace(/\+/g, '-');
}

//配置好session()后再配置xsrf，防止跨域请求伪造

module.exports = function(req, res, next){

    var token = req.session._csrf || (req.session._csrf = uid(24));

    var requestToken = req.headers['x-xsrf-token'];

    res.cookie('XSRF-TOKEN',token);

    switch(req.method){
        case 'GET':
        case 'HEAD':
        case 'OPTIONS':
            break;
        default :
            if ( token !== requestToken ){
                return res.send(403);
            }
    }

    return next();
};