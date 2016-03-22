var fs = require('fs');
var pathLib = require('path');
var urlLib = require('url');
var merge = require('merge');
var mkdirp = require("mkdirp");
var trace = require("plug-trace");
var iconv = require("iconv-lite");
var Stack = trace.stack;

var debug = require('debug')('mockx:manager')

var helper = require('./helper');
var _h = helper;

// 检测DIP使用
// var dns = require('dns');

var MockBullet = require('./bullet');

// 初始化 plugbase的trace
var pkgName = require(pathLib.join(__dirname, "/../package.json")).name;
process.on(pkgName, function (data) {
  console.log("\n=== Served by %s ===", trace.chalk.white(pkgName));
  trace(data);
});

function Mock(param, confDir) {
  this.param = param;
  // 这个inited作甚?

  this.confDir = confDir ||  pathLib.join(process.cwd(), ".config");

  this.prepareConfig();

  this._loadConfig();
}

// 其实应该mockx去做，只需要给我关于mockx.js的配置就行了
Mock.prototype.prepareConfig = function () {
  // plug-base传进来的mockx.js所在的配置文件夹
  var confDir = this.confDir;

  if (!fs.existsSync(confDir)) {
    mkdirp.sync(confDir);
    fs.chmod(confDir, 0777);
  }

  this.confFile = pathLib.join(confDir, pkgName + '.js');
  if (!fs.existsSync(this.confFile)) {
    fs.writeFileSync(this.confFile, "module.exports = " + JSON.stringify([
        {
          route: "url path",
          json: "local path"
        }
      ], null, 2) + ';');
    fs.chmod(this.confFile, 0777);
  }

  var cacheDir = pathLib.join(confDir, "../.cache/" + pkgName);
  if (!fs.existsSync(cacheDir)) {
    mkdirp.sync(cacheDir);
    fs.chmod(pathLib.dirname(cacheDir), 0777);
    fs.chmod(cacheDir, 0777);
  }
  this.runtimeFile = pathLib.join(cacheDir, pkgName + '.js');
}

/**
 * 加载配置，
 * 执行时机
 * - 初始化
 * - 每次流handle时，为了方便用户实时修改配置，实时生效
 * @return {[type]} [description]
 */
Mock.prototype._loadConfig = function () {
  delete require.cache[this.confFile];
  this.configs = require(this.confFile);
  // 仅执行一次fetch dip，为了保证速度
  this.configs = this._compileDipConfig(this.configs);

  this._genRuntimeFile();
};

Mock.prototype._genRuntimeFile = function () {
  fs.writeFileSync(this.runtimeFile, "module.exports = " + JSON.stringify(this.configs, null, 2) + ";");
  fs.chmod(this.runtimeFile, 0777);
};

/**
 * 做一些解析，比如dip转化为正常的配置
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 *
 * 
 */
Mock.prototype._compileDipConfig = function (configs) {

  var _this = this;
  // 根据appId请求DIP平台获取其下的schemas
  configs.forEach(function (config) {
    if (config.dipApp) {
      configs = configs.concat(_h.getSchemasByAppId(config.dipApp));
    }
  });

  // 将schemas转化为可用的config
  configs = configs.map(function (config) {
    if (config.dipSchema) {
      config = merge(_h.getConfigBySchemaId(config.dipSchema), config);
    }
    return config;
  });

  dipCompiled = true;

  return configs;
};

/**
 * 处理每次的req
 */
Mock.prototype.handle = function (req, res, next) {
  // 每次都重新加载配置，为了方便修改配置文件时及时更新，不需要重启node服务
  this._loadConfig();
  var config = this._findMatchConfig(req);
  debug('handle a request');

  if (!config) {
    debug('no match config, skip');
    next();
  }
  else {
    res.mockHeaders = config;

    function handleResponse(err, targetPath, charset, dataStr, statusCode, headers) {
      debug('get bullet response data');
        // log
      var stack = new Stack(pkgName);
      stack.request((req.connection.encrypted ? "https" : "http") + "://" + req.headers.host, req.url);
      stack.info(config, "Target Config");

      headers = headers || {};
      statusCode = statusCode || 200;

      if (!err) {

        // 可pipe的对象
        if(dataStr.pipe) {
          debug('response pipe')
          res.writeHead(statusCode, headers);
          dataStr.pipe(res);

        } else if(dataStr){
          debug('response string');

          res.writeHead(statusCode, headers);
       
          res.buffer = iconv.encode(dataStr, config.charset || charset);

          res.end(res.buffer);
        }
      }
      else {
        debug('eror response 404');
        res.writeHead(404);
        res.end();

        stack.error(err);
      }
      // 这个next什么意思。
      // next();
      stack.response(targetPath);
    }

    new MockBullet(req, config, this.param, handleResponse, res);
    // 最后传入的res，为了方便remote的情况处理，后期需优化 OPTI
  }
};

/**
 * 查找匹配的config，然后执行处理
 *
 * connect/express将url做了改变，http://localhost/api/records -> req.url /api/records
 */
Mock.prototype._findMatchConfig = function (req) {
  var urlMeta = urlLib.parse(req.url, true);

  var path = urlMeta.pathname,
    reqData = merge(req.query, req.body),
    host = urlMeta.host || req.headers.host;

  var matchConfigs = [],
    matchConfig = null;

  // 多个匹配的，字符串大于正则
  this.configs.forEach(function (config) {

    if (_h.checkMatch(_h.removeLastBackslash(config.route), _h.removeLastBackslash(path) ) && _h.ifQueryMatch(config.data, reqData) && _h.ifHostMatch(config.host, host)) {
      // 是用第一个匹配的，还是后面的强于前面的?
      // matchConfig = config;
      matchConfigs.push(config);
    }
  }.bind(this));

  // 做排序，取第一个，如果是正则就往后面放，字符串往前面放
  var stringMatches = [],
    regMatches = [];

  matchConfigs.forEach(function (config) {
    if(_h.isRegExp(config.route)) {
      regMatches.push(config);
    } else {
      stringMatches.push(config);
    }
  });

  matchConfig = stringMatches[0] || regMatches[0] || null;

  return matchConfig;
};

module.exports = Mock;
