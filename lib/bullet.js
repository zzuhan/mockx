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

var compareWrap = require('./compare-wrap');

/**
 * 子弹 一个匹配
 * @param {Object}   config
 * @param {Object}   req    original request
 * @param {Function} cb     流程中callback，即处理函数
 * @param {[type]}   param  初始化mockx时的param
 */

function MockBullet(req, config, param, cb) {
  this.cb         = cb;
  this.config     = config;
  this.req        = req;
  this.param      = param;
  this.hosts      = param.hosts || {};
  this.base       = pathLib.join(this.param.confDir, this.param.mockDir);
  // 正则路径的计算
  this.regMatched = null;

  if (helper.isRegExp(config.route)) {
    this.preProcessReg();
  }

  var fullUrl   = (req.connection.encrypted ? 'https' : 'http') + '://' + req.headers['host'] + req.url,
      reqUrlObj = urlLib.parse(fullUrl);

  this.reqUrlObj = reqUrlObj;
  this.fullUrl   = fullUrl;

  if(config.compare) {
    config.origRemote = config.remote;
    config.remote = 'self';
  }
  
  if (config.remote) {
    return this.handleByRemote();
  }

  // 
  if (config.file) {
    return this.handleByFile();
  }

  if (config.http) {
    return this.handleByHttp();
  } 

  if (config.jsdata) {
    return this.handleByJsData();
  }

  if (config.json) {
    return this.handleByJSON();
  }

  if (config.jsontext) {
    return this.handleByJSONText();
  }
}

// 提前做正则的处理
MockBullet.prototype.preProcessReg = function () {
  this.regMatched = this.req.url.match(this.config.route);
}

// helper methods
MockBullet.prototype.setHeader = function () {

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
// TODO 哪些参数是必须的，就放置到前面
// data,  targetPath 必须的
MockBullet.prototype._callback = function (err, data/* 如果是对象就需要处理，非对象不独处 */, statusCode, headers, targetPath, charset) {
  debug('callback invoked, get handled data');
  var _this = this;
  var config = this.config;

  if (typeof data === 'object' && !data.pipe) {
    // jsonp处理
    if (this.config.jsonp) {
      var callbackFuncName = this.req.query[this.config.jsonp];
      data                 = callbackFuncName + '(' + JSON.stringify(data) + ')';
    } else {
      data = JSON.stringify(data);
    }
  }

  var req = this.req;

  // 如果compare则再请求一次，再请求时就把compare关掉。
  if(config.compare) {
    config.remote = config.origRemote;
    config.compare = false;
    new MockBullet(this.req, config, this.param, function (err, mockData, targetPath, statusCode, headers, charset) {
      // 可以对两者的结果进行compare了哈哈。就不用再返回结果了
      compareWrap(data, mockData, req, _this.base);
      // 再返回之前的结果
      //  setTimeout(function () {
      //   _this.cb(err, data, targetPath, statusCode, headers, charset);
      // }, _this.config.responseTime ||  _this.config.delay || 0);
    });

    // 这个最终也要返回吧

  } else {
    setTimeout(function () {
      _this.cb(err, data, targetPath, statusCode, headers, charset);
    }, _this.config.responseTime ||  _this.config.delay || 0);

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

  return fullpath;
}

MockBullet.prototype.handleByFile = function () {
  var config = this.config;

  var file = pathLib.isAbsolute(config.file) ? config.file : this.getFullpath(config.file),
      stats;

  // throws if paths not exist
  try {
    stats = fs.lstatSync(file);
  } catch (e) {
    this._callback(file + ' Not exists, or Not a valid file');
    return;
  }

  if (stats.isFile()) {
    var fileType = config.fileType || helper.getFileMime(file);
    if(!fileType) {
      throw new Error("can't auto recognize file type,please set config.fileType eg:.css -> text/css");
    }
    var fileStream = fs.createReadStream(file);
    this._callback(null, fileStream, 200,  {'Content-Type': fileType + ';charset=utf-8'}, file);
  } else {
    this._callback(file + ' Not exists, or Not a valid file');
  }
}

MockBullet.prototype.response404 = function () {
  var config = this.config;

  var file = pathLib.isAbsolute(config.file) ? config.file : this.getFullpath(config.file),
      stats;

  // throws if paths not exist
  try {
    stats = fs.lstatSync(file);
  } catch (e) {
    this._callback(file + ' Not exists, or Not a valid file');
    return;
  }

  if (stats.isFile()) {
    var fileType = config.fileType || helper.getFileMime(file);
    if(!fileType) {
      throw new Error("can't auto recognize file type,please set config.fileType eg:.css -> text/css");
    }
    var fileStream = fs.createReadStream(file);
    this._callback(null, fileStream, 200,  {'Content-Type': fileType + ';charset=utf-8'}, file);
  } else {
    this._callback(file + ' Not exists, or Not a valid file');
  }
}

MockBullet.prototype.handleByJSON = function () {
  var fullpath = this.getFullpath(this.config.json);

  try {
    var buff    = fs.readFileSync(fullpath);
    var charset = isUtf8(buff) ? "utf8" : "gbk";
    var translate = {
      'utf8': 'utf-8',
      'gbk': 'gbk'
    }
    var headerCharset = translate[charset];
    // console.log('file charset is', charset);
    var dataTpl = iconv.decode(buff, charset);
    // 模板系统
    var data = require('./compile')(JSON.parse(dataTpl), this.req);

    this._callback(null, data, 200, {'Content-type': 'application/json;charset=' + headerCharset}, fullpath, charset);

  } catch (e) {
    console.log(e);
    this._callback(fullpath + ' Not exists, or Not a valid json');
  }
}

MockBullet.prototype._handleByJSON = function (req, jsonString) {
  return require('./compile')(jsonString, req);
}

MockBullet.prototype._handleByFile = function (req, jsonString) {
  return jsonString
}

MockBullet.prototype._handleByJSData = function (req, jsonString) {
  // 这样貌似不能执行吧，要用eval吗？
  return jsonString(req);
}

MockBullet.prototype.handleByJSONText = function () {
  var jsontext = this.config.jsontext;

  try {

    this._callback(null, jsontext, 200, {'Content-type': 'application/json;charset=utf-8'}, 'jsontext', 'utf8');

    // {'Content-Type': fileType + ';charset=utf-8'}

  } catch (e) {
    console.log(e);
    this._callback('Not valid jsontext, please check');
  }
}

MockBullet.prototype.handleByJsData = function () {
  debug('handleByJsData');
  var fullpath    = this.getFullpath(this.config.jsdata);
  var requirePath = pathLib.resolve(fullpath);
  delete require.cache[requirePath];

  var returnData = require(requirePath)(this.req);

  // node的模块，要求都是utf-8编码
  this._callback(null, returnData, null, null, fullpath, 'utf8');
}

MockBullet.prototype.handleByHttp = function () {
  var config = this.config;

  var http = config.http;

  this._callback(null, 'a http respond', http.statusCode, http.headers, 'httpStatus', 'utf8');
}

MockBullet.prototype.handleByRemote = function () {
  var _this = this;

  var config    = this.config,
      reqUrlObj = this.reqUrlObj,
      req       = this.req;

  // 生成的options
  var finalPath/*包含query*/, finalHost, finalPort, finalProtocol;

  // origin条件，兼容老的`self`这个值
  if (config.remote == 'self' || config.remote == 'origin' || config.remote == 'original') {
    if (!this.hosts[reqUrlObj.hostname]) {
      throw new Error('请把此host配置' + reqUrlObj.hostname + '写入flex-hosts配置中');
    }

    // host可以是个IP也可以是个域名
    finalHost = this.hosts[reqUrlObj.hostname];
    finalPath = req.url;
    finalPort = reqUrlObj.port;
    finalProtocol = reqUrlObj.protocol;

    // 非origin条件
  } else {
    var remoteUrl = config.remote;
    // 先通过正则替换
    var regMatched = this.regMatched;
    if (regMatched) {
      remoteUrl = remoteUrl.replace(/\$(\d{1,})/g, function (t, num) {
        return regMatched[num] ? regMatched[num] : t;
      });
    }

    var remoteUrlObj = urlLib.parse(remoteUrl);

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

  debug('options', options);

  debug('rawBody length ', req.rawBody && req.rawBody.length);

  if(process.env.DEBUG) {
    var writeContent = ['mockx-remote-boundry-----------------------------------',
      'request: ' + '\n' + (req.connection.encrypted ? "https" : "http") + "://" + req.headers.host + req.url,
      'options: '  + '\n'  + JSON.stringify(options),
      'body: '  + '\n'  + req.rawBody.toString(),
      'mockx-remote-boundry-----------------------------------'].join('\n\n');

    fs.appendFileSync(pathLib.join(this.base, 'mockx-remote.log'), writeContent);
  }
  
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

    _this._callback(null, proxyRes, proxyRes.statusCode, proxyRes.headers, finalUrl, null);
  });
  
  proxyReq.write(req.rawBody || '');
  proxyReq.end();
};
  
module.exports = MockBullet;