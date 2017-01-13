// 这个是比对的js文件
var compare = require('./compare');

var fs = require('fs');
var fse = require('fs-extra');

var urlLib = require('url');
var pathLib = require('path');

module.exports = function compareWrap(local, online, req, config) {

	var localDone = false;
	var onlineDone = false;

	var localChunks = [];
	var onlineChunks = [];
	var localString = '';
	var onlineString = '';

	if(local.pipe) {
		local.on('data', function(chunk){
			localChunks.push(chunk);
		});
		local.on('end', function(){
			localString = localBuffer.concat(localChunks) + '';
			localDone = true;
			onDone();
		});
	} else {
		localDone = true;
		localString = local;
		onDone();
	}

	if(online.pipe) {
		online.on('data', function(chunk){
			onlineChunks.push(chunk);
		});
		online.on('end', function(){
			onlineString = Buffer.concat(onlineChunks) + '';
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
			var urlObj = require('url').parse(req.url, true);
			var dir = pathLib.join(config.mockDir, './compare/', req.headers['host'] , (urlObj.pathname).substr(1).replace(/\//g, '.'));

			var diffHTML = fs.readFileSync(__dirname + '/diff.tpl').toString()
			diffHTML = diffHTML.replace('{{leftJSON}}', localString);
			diffHTML = diffHTML.replace('{{rightJSON}}', onlineString);

			try {
				fse.mkdirsSync(dir, 0777);
			} catch(e) {
				console.log(e);
			}

			fs.writeFileSync(dir + '/diff.html', diffHTML);
			fs.writeFileSync(dir + '/local.json', localString);
			fs.writeFileSync(dir + '/remote.json', onlineString);

			var diffs = compare(localString, onlineString);
			if(diffs.length) {
				console.log('有' + diffs.length + '项差异');
			} else {
				console.log('恭喜你，没有差异，比对');
			}
		}
	}


}

// 下面的才是好戏呢