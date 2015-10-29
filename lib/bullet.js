var fs = require('fs');
var http = require('http');
var pathLib = require('path');
var urlLib = require('url');
var async = require('async');
var merge = require('merge');
var iconv = require('iconv-lite');
var isUtf8 = require('is-utf8');
var Qs = require('qs');

/**
 * 子弹 一个匹配
 * @param {Object}   config
 * @param {Object}   req    original request
 * @param {Function} cb     流程中callback，即处理函数
 * @param {[type]}   param  初始化mockx时的param
 */
function MockBullet(req, config, param, cb, res) {
  var _this = this;

  this.req = req;
  this.hosts = param.hosts || {};
  // process.cwd() 启动所在的目录有关，所以鸡肋
  this.base = pathLib.dirname(param.rootdir) || process.cwd();

  var matched = null;
  if (typeof config.route != "string") {
    matched = req.url.match(config.route);
  }

  var fullUrl = (req.connection.encrypted ? 'https' : 'http') + '://' + req.headers['host'] + req.url,
    reqUrlObj = urlLib.parse(fullUrl);
    // currentHost = req.headers.host,
    // currentPort = req.headers.host.split(':')[1] || 80;

  // 如果remote，使用特定方式返回，其实直接返回remote的所有内容，
  // 相当于是一个透明代理服务器
  // 当为self时

  if(config.remote == 'self') {

    if(!this.hosts[reqUrlObj.hostname]) {
      throw new Error('请把此host配置' + reqUrlObj.hostname + '写入flex-hosts配置中');
    }

    var options = {
      // 对应req.headers.host对应的线上IP
      // TODO 有可能其未填写，需要提示报错
      host: this.hosts[reqUrlObj.hostname],
      port: reqUrlObj.port,
      // 参见 https://nodejs.org/api/http.html#http_message_url nodejs原生url字段，包含path和query
      path: req.url,
      method: req.method,
      headers: req.headers
    }

    var rawBody = Qs.stringify(req.body || {});

    var proxyReq = http.request(options, function (proxyRes) {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    // TODO 如何把body也write上
    // req.pipe(proxyReq);
    proxyReq.write(rawBody);
    proxyReq.end();

    return;
  } 

  // 即请求到其它url
  if(config.remote) {
    var remoteUrlObj = urlLib.parse(config.remote);
    // var requestUrlObj = urlLib.parse(req.url);

    var fetchPath = urlLib.format({
      pathname: remoteUrlObj.pathname,
      query: req.query
    });

    var options = {
      host: remoteUrlObj.hostname,
      port: remoteUrlObj.port,
      // path需要拼接上当前req的query
      path: fetchPath,
      method: req.method,
      // headers中的host是否需要修改
      headers: req.headers
    }

    // console.log('req.query is', req.query);
    // console.log('req body is', req.body);
    // console.log('req url is', req.url);

    // console.log('req.rawBody is', req.rawBody);

    var rawBody = Qs.stringify(req.body || {});

    var proxyReq = http.request(options, function (proxyRes) {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.write(rawBody);
    proxyReq.end();

    return;
  }


  // 简单点，先全都放入？然后里面再判断？
  var queue = [
    function (callback) {
      _this.jsonHandler(config.json, matched, callback);
    },

    function (callback) {
      _this.jsDataHandler(config.jsData, matched, callback);
    }
  ];

  // TODO 感觉需要merge这个是伪命题，要么我就用本地，要么服务端，要么把服务端自己搞到本地。

  // parallel
  async.parallel(queue, function (err, results) {
    if (err) cb(err);

    // 数据处理

    var jsonRet = results[0] || null,
      jsDataRet = results[1] || null;

    // 优先级
    var ret = merge(jsonRet, jsDataRet);

    if (!jsonRet && !jsDataRet) {
      cb(err, "[Fake Path]");
    }
    else {
      if (config.jsonp) {
        var callbackFuncName = req.query[config.jsonp];
        ret.data = callbackFuncName + '(' + JSON.stringify(ret.data) + ')';
      } else {
        ret.data = JSON.stringify(ret.data);
      }

      // TODO responseTime添加到此，是否合适
      setTimeout(function () {
        cb(null, ret.path, ret.charset, ret.data);
      }, config.responseTime || 0);
    }
  });
}

// jsonHandler jsDataHandler
['json', 'jsData'].forEach(function (type) {
  MockBullet.prototype[type + 'Handler'] = function (target, matched, callback) {
    // 如果不存在，返回null就行了
    if (!target || target.indexOf('#') == 0) {
      callback(null, null);
    }
    else {
      if (matched) {
        target = target.replace(/\$(\d{1,})/g, function (t, num) {
          return matched[num] ? matched[num] : t;
        });
      }
      this.handlers[type].bind(this)(this.req, target, callback);
    }
  }
});

// OPTI 这个实现有点ugly
MockBullet.prototype.handlers = {

  json: function (req, filepath, callback) {
    var fullpath = pathLib.join(this.base, filepath);

    try {
      var buff = fs.readFileSync(fullpath);
      var charset = isUtf8(buff) ? "utf-8" : "gbk";
      var dataTpl = iconv.decode(buff, charset);
      // 模板系统
      var data = require('./compile')(JSON.parse(dataTpl), req);

      callback(null, {data: data, path: fullpath, charset: charset});

    } catch (e) {
      callback(fullpath + ' Not exists, or Not a valid json');
    }
  },

  jsData: function (req, filepath, callback) {
    var fullpath = pathLib.resolve(pathLib.join(this.base, filepath));
    delete require.cache[fullpath];
    // 需要传入一个req
    callback(null, {data: require(fullpath)(req), path: fullpath, charset: "utf-8"});
  }

  
  
};

// function parseJSONorJSONP(str, callback, jsonpName){
//   try { 
//     jsonData = JSON.parse(str)
//     callback(jsonData);

//   // 假设是jsonp，进行解析
//   } catch(e) {
//     var f = new Function(jsonpName, str);
//     f(callback);
//   }
// }


module.exports = MockBullet;
