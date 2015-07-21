module.exports = Mock;

var fs = require('fs');
var pathLib = require('path');
var urlLib = require('url');
var async = require('async');
var merge = require('merge');

var MockBullet = require('./bullet');

// Manager Center
function Mock(params, confDir){
	confDir = confDir || '';
	this.confFile = pathLib.join(confDir, 'mockx.json');
	this.hosts = params.hosts;
	this.loadConfig();
}

Mock.prototype.loadConfig = function () {
	this.configs = JSON.parse( fs.readFileSync(this.confFile).toString() );
}

Mock.prototype.handle = function (req, res, next) {
	// 每次都重新加载配置，为了方便修改配置文件时及时更新，不需要重启node服务
	this.loadConfig();

	var _this = this;
		this.req = req;

	var config = this.findMatchConfig(req);

	if(!config) { return next(); }

	new MockBullet(config, req, function (err, data) {
		if(!err) {
			// 根据结果，判断调用res还是next
			if(data === null) next();

			res.writeHead(200, {
			  'Content-Type': 'application/json' }
			);
			res.write(JSON.stringify(data));
			res.end();

		// 或者不应该我来把error写出来
		} else {
			res.write(err);
			res.end();
		}  
	}, this.hosts);
}

/**
 * 查找匹配的config，然后执行处理 
 */
Mock.prototype.findMatchConfig = function (req) {
	var url = req.url,
		urlMeta = urlLib.parse(req.url, true);

	var matchConfig = null;
	this.configs.forEach(function (config, i) {
		if(config.route == urlMeta.pathname && ifQueryMatch(config.query || {}, urlMeta.query || {})) {
			// TODO 此时就可以退出forEach还是？
			// 是用第一个匹配的，还是后面的强于前面的
			matchConfig = config;
		}
	});

	function ifQueryMatch(queryConfig, reqQuery){
		for(var key in queryConfig){
			if(queryConfig[key] !== reqQuery[key]) {
				return false;
			}
		}
		return true;
	}

	return matchConfig;
};

