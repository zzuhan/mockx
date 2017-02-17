// 这个是比对的js文件
var compare = require('./compare');

var fs = require('fs');
var fse = require('fs-extra');
var colors = require('colors/safe');

var urlLib = require('url');
var pathLib = require('path');
var zlib = require('zlib');

module.exports = function compareWrap(online, local, req, mockDir) {
	var localDone = false;
	var onlineDone = false;

	var localChunks = [];
	var onlineChunks = [];
	var localString = '';
	var onlineString = '';

	if(local.pipe) {
		var localStream = local.pipe(zlib.createGunzip());

		localStream.on('data', function(chunk){
			localChunks.push(chunk);
		});
		localStream.on('end', function(){
			localString = Buffer.concat(localChunks).toString();

			localDone = true;
			onDone();
		});
	} else {
		localDone = true;
		localString = local;
		onDone();
	}

	if(online.pipe) {
		// TODO 现在还不能确定是不是全是gzip
		// writeStream能否不是一个文件
		var stream = online.pipe(zlib.createGunzip());

		stream.on('data', function(chunk){
			onlineChunks.push(chunk);
		});
		stream.on('finish', function(){
			onlineString = Buffer.concat(onlineChunks).toString();

			onlineDone = true;
			onDone();
		});
	} else {
		onlineDone = true;
		onlineString = online;
		onDone();
	}

	function onDone(){

		if(localDone && onlineDone) {
			try {

				var urlObj = require('url').parse(req.url, true);

				var apiFullPath = req.headers['host'] + urlObj.pathname;

				var compareDir = pathLib.join(mockDir, './compare/');

				var dir = pathLib.join(mockDir, './compare/', req.headers['host'] , (urlObj.pathname).substr(1).replace(/\//g, '.'));

				var diffHTML = fs.readFileSync(__dirname + '/diff.tpl').toString()
				diffHTML = diffHTML.replace('{{leftJSON}}', localString);
				diffHTML = diffHTML.replace('{{rightJSON}}', onlineString);

			} catch(e) {
				console.log(e);
			} 

			try {
				fse.mkdirsSync(dir, 0777);
			} catch(e) {
				console.log(e);
			}

			try {

				// 写文件
				fs.writeFileSync(dir + '/diff.html', diffHTML);
				fs.writeFileSync(dir + '/local.json', localString);
				fs.writeFileSync(dir + '/remote.json', onlineString);

				// console输出
				var diffs = compare(localString, onlineString);

				var prefix = '【mockx接口比对】' + colors.yellow(apiFullPath + ' ');
				var suffix = ' 请访问 ' + colors.blue.underline('localhost/diff/detail?path=' + apiFullPath) +  ' 查看详细结果';

				if(diffs.length) {
					console.log(prefix + colors.red('有' + diffs.length + '项差异') + suffix);
				} else {
					console.log(prefix + colors.green('恭喜你，没有差异') + suffix);
				}

				// diffs.json记录
				var diffFile = pathLib.join(compareDir + '/diffs.json');
				fse.ensureFileSync(diffFile);

				try {
					var diffs = require(diffFile) || {};
				} catch(e) {
					var diffs = {};
				}

				diffs[apiFullPath] = {
					passed: diffs.length == 0
				}

				console.log(diffs);

				fse.writeFileSync(diffFile, JSON.stringify(diffs));

			} catch(e) {
				console.log(e);
			} 
		}
	}
}

// 下面的才是好戏呢
