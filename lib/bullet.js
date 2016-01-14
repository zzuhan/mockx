var fs      = require('fs');
var http    = require('http');
var https    = require('https');
var pathLib = require('path');
var urlLib  = require('url');
var iconv   = require('iconv-lite');
var isUtf8  = require('is-utf8');
var trace = require("plug-trace");
var Stack = trace.stack;

var debug = require('debug')('mockx:bullet')

var pkgName = require(pathLib.join(__dirname, "/../package.json")).name;

var Qs      = require('qs');

var helper = require('./helper');

/**
 * 子弹 一个匹配
 * @param {Object}   config
 * @param {Object}   req    original request
 * @param {Function} cb     流程中callback，即处理函数
 * @param {[type]}   param  初始化mockx时的param
 */

function MockBullet(req, config, param, cb, res) {

  this.cb         = cb;
  this.config     = config;
  this.req        = req;
  this.res        = res;
  this.param      = param;
  this.hosts      = param.hosts || {};
  this.base       = pathLib.dirname(param.rootdir) || process.cwd();
  this.regMatched = null;

  if (helper.isRegExp(config.route)) {
    this.preProcessReg();
  }

  var fullUrl   = (req.connection.encrypted ? 'https' : 'http') + '://' + req.headers['host'] + req.url,
      reqUrlObj = urlLib.parse(fullUrl);

  this.reqUrlObj = reqUrlObj;
  this.fullUrl   = fullUrl;

  if (config.file) {
    this.handleByFile();
  }

  if (config.remote) {
    this.handleByRemote();
  }

  if (config.jsData) {
    this.handleByJsData();
  }

  if (config.json) {
    this.handleByJSON();
  }
}

// 提前做正则的处理
MockBullet.prototype.preProcessReg = function () {
  this.regMatched = this.req.url.match(this.config.route);
}

MockBullet.prototype.handleByFile = function () {
  debug('handleByFile')
  var config = this.config;

  var file = pathLib.isAbsolute(config.file) ? config.file : this.getFullpath(config.file),
      stats;

  // throws if paths not exist
  try {
    stats = fs.lstatSync(file);
  } catch (e) {
    this.callback(file + ' Not exists, or Not a valid file');
    return;
  }

  if (stats.isFile()) {
    if(!config.fileType) {
      throw new Error('config.fileType must setting eg:.css -> text/css');
    }
    var fileStream = fs.createReadStream(file);
    this.callback(null, file, null, fileStream, 200,  {'Content-Type': config.fileType});
  } else {
    this.callback(file + ' Not exists, or Not a valid file');
  }
}

MockBullet.prototype.handleByJSON = function () {
  debug('handleByJSON')

  var fullpath = this.getFullpath(this.config.json);

  try {
    var buff    = fs.readFileSync(fullpath);
    var charset = isUtf8(buff) ? "utf8" : "gbk";
    // console.log('file charset is', charset);
    var dataTpl = iconv.decode(buff, charset);
    // 模板系统
    var data = require('./compile')(JSON.parse(dataTpl), this.req);

    this.callback(null, fullpath, charset, data);

  } catch (e) {
    this.callback(fullpath + ' Not exists, or Not a valid json');
  }
}

// OPTI getFullpath 这名字不太掉
MockBullet.prototype.getFullpath = function (relativePath) {
  var regMatched = this.regMatched;

  if (regMatched) {
    relativePath = relativePath.replace(/\$(\d{1,})/g, function (t, num) {
      return regMatched[num] ? regMatched[num] : t;
    });
  }

  var fullpath = pathLib.join(this.base, relativePath);

  // console.log('fullpath is ' + fullpath);
  // console.log(regMatched);

  return fullpath;
}

MockBullet.prototype.handleByJsData = function () {
  debug('handleByJsData');
  var fullpath    = this.getFullpath(this.config.jsData);
  var requirePath = pathLib.resolve(fullpath);
  delete require.cache[requirePath];

  var returnData = require(requirePath)(this.req);

  // node的模块，要求都是utf-8编码
  this.callback(null, fullpath, 'utf8', returnData);
}


// 这之后，可插件化，加入一些其他的东西
/**
 * [callback description]
 * @param  {[type]}   err        [description]
 * @param  {[type]}   targetPath [description]
 * @param  {[type]}   charset    [description]
 * @param  {String|Object|Object pipe}   data       [description]
 * @param  {[type]}   statusCode [description]
 * @param  {[type]}   headers    [description]
 * @return {Function}            [description]
 */
MockBullet.prototype.callback = function (err, targetPath, charset, data/* 如果是对象就需要处理，非对象不独处 */, statusCode, headers) {
  debug('callback invoked, get handled data');
  var _this = this;

  if (typeof data === 'object' && !data.pipe) {
    // jsonp处理
    if (this.config.jsonp) {
      var callbackFuncName = this.req.query[this.config.jsonp];
      data                 = callbackFuncName + '(' + JSON.stringify(data) + ')';
    } else {
      data = JSON.stringify(data);
    }
  }

  setTimeout(function () {
    _this.cb(err, targetPath, charset, data, statusCode, headers);
  }, _this.config.responseTime ||  _this.config.delay || 0);

}

MockBullet.prototype.handleByRemote = function () {
  var _this = this;

  var config    = this.config,
      reqUrlObj = this.reqUrlObj,
      req       = this.req;

  // 生成的options
  var finalPath/*包含query*/, finalHost, finalPort, finalProtocol;

  // self条件
  if (config.remote == 'self') {
    if (!this.hosts[reqUrlObj.hostname]) {
      throw new Error('请把此host配置' + reqUrlObj.hostname + '写入flex-hosts配置中');
    }

    finalHost = this.hosts[reqUrlObj.hostname];
    finalPath = req.url;
    finalPort = reqUrlObj.port;
    finalProtocol = reqUrlObj.protocol;

    // 非self条件
  } else {
    var remoteUrlObj = urlLib.parse(config.remote);

    finalHost = remoteUrlObj.hostname;
    finalPort = remoteUrlObj.port;
    finalPath = urlLib.format({
      pathname: remoteUrlObj.pathname,
      query: req.query
    });
    finalProtocol = remoteUrlObj.protocol;
  }

  // 防止发生返回301缓存
  delete req.headers['if-modified-since'];
  delete req.headers['if-none-match'];

  finalHost = finalHost || '';
  finalPort = finalPort || '';
  finalPath = finalPath || '';
  finalProtocol = finalProtocol || '';

  var options = {
    host: finalHost,
    port: finalPort,
    path: finalPath,
    method: req.method,
    headers: req.headers
  }

  debug('options');
  debug(options);

  // var rawReqbody = Qs.stringify(req.body || {});
 
  // debug('rawBody length');
  // // debug(req.rawBody);
  // debug(req.rawBody.length);

  var reqAgents = {
    'http:': http,
    'https:': https
  }
  // console.log(reqUrlObj);
  // 如果remote字段写成 www.baidu.com/xxx protocol是否我们补全为http:
  finalProtocol = finalProtocol;
  if(!reqAgents[finalProtocol]) {
    throw new Error('remote仅支持http和https协议，原因：您未填写协议头或是不支持此协议' + finalProtocol);
  }
  
  // 发送请求
  var proxyReq = reqAgents[finalProtocol]['request'](options, function (proxyRes) {
    
    var finalUrl = finalProtocol + '//' +  finalHost + (finalPort ? ':' + finalPort : finalPort)  + finalPath;

    _this.callback(null, finalUrl, null, proxyRes, proxyRes.statusCode, proxyRes.headers);
  });
  
  proxyReq.write(req.rawBody);
  proxyReq.end();
};

function parseJSONorJSONP(str, callback, jsonpName) {
  // console.log('start parse');
  try {
    var jsonData = JSON.parse(str)
    callback(jsonData);

    // 假设是jsonp，进行解析
  } catch (e) {
    // console.log('parse jsonp');
    // console.log('jsonp str is', str);
    // bug 因为str为空，所以导致后面callback没有被执行
    var f = new Function(jsonpName, str);
    f(callback);
  }
}

module.exports = MockBullet;