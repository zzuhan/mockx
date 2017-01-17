var fs = require('fs');
var pathLib = require('path');
var urlLib = require('url');
var merge = require('merge');
var mkdirp = require("mkdirp");
var trace = require("plug-trace");
var iconv = require("iconv-lite");
var Stack = trace.stack;
var _ = require('underscore');

var debug = require('debug')('mockx:manager')

var helper = require('./helper');
var _h = helper;

// TODO DIP的编译只进行一次

// 检测DIP使用
// var dns = require('dns');

var MockBullet = require('./bullet');

// 初始化 plugbase的trace
var pkgName = require(pathLib.join(__dirname, "/../package.json")).name;
process.on(pkgName, function (data) {
  console.log("\n=== Served by %s ===", trace.chalk.white(pkgName));
  trace(data);
});

function MockWrap(param, confDir){
  param = param || {};
  param.confDir = confDir;
  return new Mock(param);
}

/**
 * 这是基础的 输入的
 * force
 * hosts
 * confDir
 *
 * 缺少一个projectDir或者用process.cwd()来替代吗？
 * mockDir
 * rules
 * domains
 */
function Mock(config) {
  var defaultConfig = {
    force: false,
    hosts: [],
    confDir: pathLib.join(process.cwd(), ".config"),
    mockDir: '',
    rules: [],
    domains: [],
    enableDip: true
  }

  this.config = _.extend(defaultConfig, config);

  this.rules = null;
  this.confFile = null;
  this.runtimeFile = null;
  this.dipCompiled = false;

  this.init(); 
}
/**
 * confFile
 * runTimeFile
 */
Mock.prototype.init = function () {
  this.prepareConfig();
  this._loadConfig();
}

// 其实应该mockx去做，只需要给我关于mockx.js的配置就行了
Mock.prototype.prepareConfig = function () {
  // plug-base传进来的mockx.js所在的配置文件夹
  var confDir = this.config.confDir;

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
Mock.prototype._loadConfig = function (forceUpdate) {
  delete require.cache[this.confFile];

  try {
    var config = require(this.confFile);
  } catch(e) {
    console.log('请保证配置文件' + this.confFile + '正确');
  }
  this.config = _.extend(this.config, config);
  this.rules = this.config.rules;
  this.rules = this._makeDomainTransparent(this.config.domains, this.rules);

  // 仅执行一次fetch dip，为了保证速度
  // 还是不能保证执行多次
  if(this.enableDip || forceUpdate) {
    this.rules = this._compileDipConfig(this.rules, forceUpdate);
  }

  this._genRuntimeFile();
};

Mock.prototype._genRuntimeFile = function () {
  console.log(this.config);

  function replacer(key, value) {
    if (value instanceof RegExp)
      return ("__REGEXP " + value.toString());
    else
      return value;
  }

  function reverse(string) {
    return string.replace(/\"__REGEXP\s(.*)\"/ig, '$1');
  }

  var configString = reverse(JSON.stringify(this.config, replacer, 2));

  fs.writeFileSync(this.runtimeFile, "module.exports = " + configString + ";");
  fs.chmod(this.runtimeFile, 0777);
};

/**
 * 做一些解析，比如dip转化为正常的配置
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
Mock.prototype._compileDipConfig = function (rules, forceUpdate) {

  if(this.dipCompiled && !forceUpdate) {
    return false;
  } 

  var _this = this;
  
  // 根据appId请求DIP平台获取其下的schemas
  rules.forEach(function (config) {
    if (config.dipApp) {
      rules = rules.concat(_h.getSchemasByAppId(config.dipApp));
    }
  });

  // 将schemas转化为可用的config
  rules = rules.map(function (config) {
    if (config.dipSchema) {
      config = merge(_h.getConfigBySchemaId(config.dipSchema), config);
    }
    return config;
  });

  this.dipCompiled = true;

  console.log(rules);

  return rules;
};

Mock.prototype._makeDomainTransparent = function (domains, rules) {

  domains.forEach(function (domain) {
    rules.push({
      route: /.*/i,
      domain: domain,
      remote: 'self'
    })  
  });

  return rules;
};

/**
 * 处理每次的req
 */
Mock.prototype.handle = function (req, res, next) {
  // 每次都重新加载配置，为了方便修改配置文件时及时更新，不需要重启node服务
  if(req.url == '/upmockx') {
    this._loadConfig(true);
    res.writeHead(200);
    res.end('Mockx update success');
    return;
  } else {
    this._loadConfig();
  }

  var rule = this._findMatchRule(req);

  if (!rule) {
    debug('no match rule, skip');
    next();
  }
  else {
    var self = this;

    function handleResponse(err, dataStr, targetPath, statusCode, headers, charset) {
      debug('get bullet response data');
      // log
      var stack = new Stack(pkgName);
      stack.request((req.connection.encrypted ? "https" : "http") + "://" + req.headers.host, req.url);
      stack.info(rule, "Target Config");

      headers = headers || {};
      if(rule.headers) {
        headers = merge(headers, rule.headers);
      }
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
       
          res.buffer = iconv.encode(dataStr, rule.charset || charset);

          res.end(res.buffer);
        }
      }
      else {
        debug('eror response 404');
        res.writeHead(404);
        res.end();

        stack.error(err);
      }

      if (self.config.force) {
        res.mockHeaders = rule;
        next();
      }

      stack.response(targetPath);
    }

    new MockBullet(req, rule, this.config, handleResponse);
    // 最后传入的res，为了方便remote的情况处理，后期需优化 OPTI
  }
};

/**
 * 查找匹配的config，然后执行处理
 *
 * connect/express将url做了改变，http://localhost/api/records -> req.url /api/records
 */
Mock.prototype._findMatchRule = function (req) {
  var urlMeta = urlLib.parse(req.url, true);

  var path = urlMeta.pathname,
      reqData = merge(req.query, req.body),
      host = urlMeta.host || req.headers.host;

  var matchRules = [],
      matchRule = null;

  // 多个匹配的，字符串大于正则
  this.rules.forEach(function (rule) {

    if (_h.checkMatch(_h.removeLastBackslash(rule.route), _h.removeLastBackslash(path) ) && _h.ifQueryMatch(rule.data, reqData) && _h.ifHostMatch(rule.host, host)) {
      // 是用第一个匹配的，还是后面的强于前面的?
      // matchConfig = rule;
      matchRules.push(rule);
    }
  }.bind(this));

  // 做排序，取第一个，如果是正则就往后面放，字符串往前面放
  var stringMatches = [],
      regMatches = [];

  matchRules.forEach(function (rule) {
    if(_h.isRegExp(rule.route)) {
      regMatches.push(rule);
    } else {
      stringMatches.push(rule);
    }
  });

  matchRule = stringMatches[0] || regMatches[0] || null;

  return matchRule;
};

module.exports = MockWrap;
