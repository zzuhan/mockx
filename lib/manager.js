module.exports = Mock;

var fs = require('fs');
var pathLib = require('path');
var urlLib = require('url');
var merge = require('merge');

var MockBullet = require('./bullet');

var request = require('sync-request');

// Manager Center

function Mock(params, confDir) {
  this.inited = false;
  confDir = confDir || '';
  this.confFile = pathLib.join(confDir, 'mockx.js');
  this.runtimeFile = pathLib.join(confDir, 'mockx.runtime.js');

  this.hosts = params.hosts;
  this._loadConfig();
  this.inited = true;
}

/**
 * 加载配置，
 * 执行时机
 * - 初始化
 * - 每次流handle时，为了方便用户实时修改配置，实时生效
 * @return {[type]} [description]
 */
Mock.prototype._loadConfig = function () {
  if (!fs.existsSync(this.confFile)) {
    fs.writeFileSync(this.confFile, "module.exports = [];");
    fs.chmod(this.confFile, 0777);
  }
  delete require.cache[this.confFile];
  this.configs = require(this.confFile);
  this.configs = this._preProcess(this.configs);
  this._genRuntimeFile();
};

Mock.prototype._genRuntimeFile = function(){
  fs.writeFileSync(this.runtimeFile, "module.exports = " + JSON.stringify(this.configs) + ";")
}

// dip缓存，即只请求一次，
var schemaCache = {}
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
    if(config.dipApp){
      configs = configs.concat(getSchemasByAppId(config.dipApp, !_this.inited));
    }
  });

  // 解析dip Schema
  configs = configs.map(function (config) {
    if(config.dipSchema) {
      config = merge(getConfigBySchemaId(config.dipSchema, !_this.inited), config );
    }
    return config;
  });

  return configs;
}

Mock.prototype.handle = function (req, res, next) {
  // 每次都重新加载配置，为了方便修改配置文件时及时更新，不需要重启node服务
  this._loadConfig();
  var config = this._findMatchConfig(req);

  if (!config) {
    return next();
  }

  new MockBullet(config, req, function (err, data) {
    if (!err) {
      // 根据结果，判断调用res还是next
      if (data === null) return next();

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.write(data);
      res.end();

      // 或者不应该我来把error写出来
    } else {
      res.write(err);
      res.end();
    }
  }, this.hosts);
};

/**
 * 查找匹配的config，然后执行处理
 *
 * 如果有两个都匹配的，后面会覆盖前面的
 */
Mock.prototype._findMatchConfig = function (req) {

	var	urlMeta = urlLib.parse(req.url, true);

	var matchConfig = null;

	this.configs.forEach(function (config) {
		var reqData = merge(req.query, req.body);

		if( checkMatch(config.route, urlMeta.pathname) && ifQueryMatch(config.data, reqData) && ifHostMatch(config.host, urlMeta.host) ) {
			// TODO 此时就可以退出forEach还是？
			// 是用第一个匹配的，还是后面的强于前面的
			matchConfig = config;
		}
	});

	return matchConfig;
};

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
function ifHostMatch(hostConfig, reqHost){
  if(!hostConfig) return true;
  return checkMatch(hostConfig, reqHost);
}

function getConfigBySchemaId(schemaId, requestIfNotExist){
  var schema = {},
    thisConfig = {};

  if(schemaCache[schemaId]) {
    schema = schemaCache[schemaId];

  // 在非inited情况下，才会去请求
  } else if(requestIfNotExist) {
    var res = request('GET',  'http://dip.alibaba-inc.com/api/v2/schemas/' + schemaId + '/content');

    schema = JSON.parse(res.getBody().toString());
    schemaCache[schemaId] = schema;
  }

  if(schema.meta && schema.meta.uri) {
    var uriMeta = urlLib.parse(schema.meta.uri, true);

    // 支持手动覆盖
    thisConfig.route = uriMeta.path 
    thisConfig.host = uriMeta.host;
    thisConfig.remote = 'http://dip.alibaba-inc.com/api/v2/services/schema/mock/' + schemaId;
  }

  return thisConfig;
}

function getSchemasByAppId(appId, requestIfNotExist) {
  var addConfigs = [];
  var schemas;

  if(!appCache[appId]) {
    var res = request('GET', 'http://dip.alibaba-inc.com/api/v2/apps/' + appId + '/schemas');
    schemas = JSON.parse(res.getBody().toString());
    appCache[appId] = schemas;
  } else if(requestIfNotExist) {
    schemas = appCache[appId];
  }

  schemas.forEach(function (schema) {
    addConfigs.push({dipSchema: schema.id});
  });

  return addConfigs;
}