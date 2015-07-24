module.exports = Mock;

var fs = require('fs');
var pathLib = require('path');
var urlLib = require('url');
var merge = require('merge');

var MockBullet = require('./bullet');

// Manager Center

function Mock(params, confDir) {
  confDir = confDir || '';
  this.confFile = pathLib.join(confDir, 'mockx.js');

  this.hosts = params.hosts;
  this.loadConfig();
}

Mock.prototype.loadConfig = function () {
  if (!fs.existsSync(this.confFile)) {
    fs.writeFileSync(this.confFile, "module.exports = [];");
    fs.chmod(this.confFile, 0777);
  }
  delete require.cache[this.confFile];
  this.configs = require(this.confFile);
};

Mock.prototype.handle = function (req, res, next) {
  // 每次都重新加载配置，为了方便修改配置文件时及时更新，不需要重启node服务
  this.loadConfig();
  var config = this.findMatchConfig(req);

  if (!config) {
    return next();
  }

  new MockBullet(config, req, function (err, data) {
    if (!err) {
      // 根据结果，判断调用res还是next
      if (data === null) next();

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
Mock.prototype.findMatchConfig = function (req) {

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
