var jwt = require('jsonwebtoken');

// 检查用户会话
module.exports = function(req, res, next) {
  console.log('检查post的信息或者url查询参数或者头信息');
  //检查post的信息或者url查询参数或者头信息
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // 解析 token
  if (token) {
    // 确认token
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        return res.status(403).json({
          error:{
            name:"Error",
            status: 403, 
            message: 'token error',
            statusCode: 403
          }
        });
      } else {
        // 如果没问题就把解码后的信息保存到请求中，供后面的路由使用
        req.api_user = decoded;
        console.dir(req.api_user);
        next();
      }
    });
  } else {
    // 如果没有token，则返回错误
    return res.status(403).json({
      error:{
        name:"Error",
        status: 403, 
        message: 'token error',
        statusCode: 403
      }
    });
  }
};