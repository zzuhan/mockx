#!/usr/bin/env node

// 1 生成flex-hosts.json文件
// 2 编写启动clam的工具

// 这些相对位置，应该都是当前的执行命令行所在的位置
var cwd = process.cwd();
var path = require('path');
const exec = require('child_process').exec;
var fs = require('fs-extra');

var confFile = path.join(cwd, 'mockx.config.js');
var mockxCacheDir = path.join(cwd, ".mockx");

// 1 生成一份flex-hosts写入
// 2 生成一份脚本，

function init(){
	console.log(confFile);

	ensureConfig();
	var config = require(confFile);

	ensureDirs();

	genHosts(config.domains);
	runServer();
}

function ensureConfig(){
  	if (!fs.existsSync(confFile)) {
	    fs.writeFileSync(confFile, fs.readFileSync(path.join(__dirname, "../lib/mockx-default.js")));
    	fs.chmod(confFile, 0777);
  	}
}

function ensureDirs(){
	fs.ensureDirSync(mockxCacheDir);
}

function genHosts(domains){
	domains = domains || [];

	var hostsCode = '{"127.0.0.1": ["' +  domains.join('","') + '"] }';

	fs.writeFileSync(path.join(mockxCacheDir + '/flex-hosts.json'), hostsCode);
}

function runServer(){
	// var serverProcess = exec('sudo node serve.js');
	// serverProcess.stdout.pipe(process.stdout);
	var server = require("plug-base");
	server.root("src"); server.config(mockxCacheDir);

	var mockx = require("../index")(confFile);
	server.plug(mockx).listen(80, 443);
}

init();