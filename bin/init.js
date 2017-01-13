// init.js 初始化文件夹结构
// simple git 
var cwd = process.cwd();
var git = require('simple-git')(cwd);
var path = require('path');

// git clone && 
// 
var gitpath = 'git@github.com:zzuhan/mockx-generator.git';

var gitDir = path.join(cwd, 'mockx-serve', '.git');

git.clone(gitpath, 'mockx-serve', {
	depth: 1
}, function () {
	console.log('downloaded');
});

