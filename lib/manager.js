var fs = require('fs');
var pathLib = require('path');
var urlLib = require('url');
var merge = require('merge');
var mkdirp = require("mkdirp");
var request = require('sync-request');
var trace = require("plug-trace");
var iconv = require("iconv-lite");
var Stack = trace.stack;

var dns = require('dns');

var MockBullet = require('./bullet');

// 先做一系列检测，保证环境是可用的
checkEnvironmentAvailable();

var pkgName = require(__dirname + "/../package.json").name;
process.on(pkgName, function (data) {
  console.log("\n=== Served by %s ===", trace.chalk.white(pkgName));
  trace(data);
});

function Mock(param, confDir) {
  this.param = param;
  this.inited = false;

  confDir = confDir || pathLib.join(process.cwd(), ".config");

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

  this._loadConfig();
  this.inited = true;
}

function checkEnvironmentAvailable(){
  // checkDipAvailable();
}

// 公司内网dns 140.205.247.89

/**
 * 使用dns info或者
 * @return {[type]} [description]
 */
// function checkDipAvailable(){
//   var dipDomain = 'dip.alibaba-inc.com',
//     aliInternalAddress = '8.8.8.8';

//   dns.lookup(dipDomain, function (err, address, family) {
//     if(!err) {
//       if(address !== aliInternalAddress) {
//         throw new Error('你现在处于外网环境，mockx的DIP功能将不能使用，请使用vpn连接内网环境再启动');
//       }
//     }
//   });
// }

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
  this.configs = this._preProcess(this.configs);
  this._genRuntimeFile();
};

Mock.prototype._genRuntimeFile = function () {
  fs.writeFileSync(this.runtimeFile, "module.exports = " + JSON.stringify(this.configs, null, 2) + ";");
  fs.chmod(this.runtimeFile, 0777);
};

// dip缓存，即只请求一次，
var schemaCache = {};
var appCache = {};

/**
 * 做一些解析，比如dip转化为正常的配置
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
Mock.prototype._preProcess = function (configs) {
  var _this = this;
  // 解析dip App
  configs.forEach(function (config) {
    if (config.dipApp) {
      configs = configs.concat(getSchemasByAppId(config.dipApp, !_this.inited));
    }
  });

  // 解析dip Schema
  configs = configs.map(function (config) {
    if (config.dipSchema) {
      config = merge(getConfigBySchemaId(config.dipSchema, !_this.inited), config);
    }
    return config;
  });

  return configs;
};

/**
 * 处理每次的req
 */
Mock.prototype.handle = function (req, res, next) {
  // 每次都重新加载配置，为了方便修改配置文件时及时更新，不需要重启node服务
  this._loadConfig();
  var config = this._findMatchConfig(req);

  if (!config) {
    next();
  }
  else {
    res.mockHeaders = config;

    new MockBullet(req, config, this.param, function (err, targetPath, charset, data) {
      var stack = new Stack(pkgName);
      stack.request((req.connection.encrypted ? "https" : "http") + "://" + req.headers.host, req.url);
      stack.info(config, "Target Config");

      if (!err) {
        res.writeHead(200, {
          'Content-Type': 'application/json;charset=' + charset
        });

        res.buffer = iconv.encode(data, charset);
        res.end(res.buffer);
      }
      else {
        res.writeHead(404);
        res.end();

        stack.error(err);
      }
      req.isMock = true;
      next();
      stack.response(targetPath);

    }.bind(this), res);
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

    if (checkMatch(config.route, path) && ifQueryMatch(config.data, reqData) && ifHostMatch(config.host, host)) {
      // 是用第一个匹配的，还是后面的强于前面的?
      // matchConfig = config;
      matchConfigs.push(config);
    }
  }.bind(this));

  // 做排序，取第一个，如果是正则就往后面放，字符串往前面放
  var stringMatches = [],
    regMatches = [];

  matchConfigs.forEach(function (config) {
    if(isRegExp(config.route)) {
      regMatches.push(config);
    } else {
      stringMatches.push(config);
    }
  });

  matchConfig = stringMatches[0] || regMatches[0] || null;

  return matchConfig;
};

module.exports = Mock;

// Helpers
// =========
function isRegExp(obj) {
  return Object.prototype.toString.call(obj) === "[object RegExp]";
}

function checkMatch(regOrString, target) {
  if (isRegExp(regOrString)) {
    return regOrString.test(target);
  } else {
    return regOrString === target;
  }
}

function ifQueryMatch(dataConfig, reqData) {
  for (var key in dataConfig) {
    if (!checkMatch(dataConfig[key], reqData[key])) {
      return false;
    }
  }
  return true;
}

/**
 * 如果不传host，则是匹配所有host
 */
function ifHostMatch(hostConfig, reqHost) {
  if (!hostConfig) return true;
  return checkMatch(hostConfig, reqHost);
}

function getConfigBySchemaId(schemaId, requestIfNotExist) {
  var schema,
    thisConfig = {};

  if (!schemaCache[schemaId] && requestIfNotExist) {
    var res = request('GET', 'http://dip.alibaba-inc.com/api/v2/schemas/' + schemaId + '/content');

    schema = JSON.parse(res.getBody().toString());
    schemaCache[schemaId] = schema;

    // 在非inited情况下，才会去请求
  } else {
    schema = schemaCache[schemaId] || {};
  }


  if (schema.meta && schema.meta.uri) {
    var uriMeta = urlLib.parse(schema.meta.uri, true);

    // 支持手动覆盖
    thisConfig.route = uriMeta.path;
    thisConfig.host = uriMeta.host;
    thisConfig.remote = 'http://dip.alibaba-inc.com/api/v2/services/schema/mock/' + schemaId;
  }

  return thisConfig;
}

function getSchemasByAppId(appId, requestIfNotExist) {
  var addConfigs = [],
    schemas;

  if (!appCache[appId] && requestIfNotExist) {
    var res = request('GET', 'http://dip.alibaba-inc.com/api/v2/apps/' + appId + '/schemas');
    schemas = JSON.parse(res.getBody().toString());
    appCache[appId] = schemas;
  } else {
    schemas = appCache[appId] || [];
  }

  schemas.forEach(function (schema) {
    addConfigs.push({dipSchema: schema.id});
  });

  return addConfigs;
}