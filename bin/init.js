#!/usr/bin/env node
// init.js 初始化文件夹结构
// simple git 
var cwd = process.cwd();
var git = require('simple-git')(cwd);
var path = require('path');

var spawn = require('child_process').spawn;

// git clone && 
// 
var gitpath = 'git@github.com:zzuhan/mockx-generator.git';

var dirOrigin = path.join(cwd, 'mockx-serve');
var gitOrigin = path.join(cwd, 'mockx-serve', '.git');

var rmPrevious = spawn('rm', ['-rf', dirOrigin]);

rmPrevious.stdout.on('data', function (data) {
	console.log('stdout', data);
});

git.clone(gitpath, 'mockx-serve', {
	depth: 1
}, function () {
	console.log('clone donw');
	
	var rmGitOrigin = spawn('rm', ['-rf', gitOrigin]);

	rmGitOrigin.stdout.on('data', function (data) {
		console.log('stdout', data);
	});
});

