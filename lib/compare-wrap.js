// 这个是比对的js文件
var compare = require('./compare');

var fs = require('fs');
var fse = require('fs-extra');

var urlLib = require('url');
var pathLib = require('path');
var zlib = require('zlib');

module.exports = function compareWrap(online, local, req, mockDir) {
    console.log('START COMPARE');

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

				console.log(mockDir, './compare/', req.headers['host'] , (urlObj.pathname).substr(1).replace(/\//g, '.'));


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

				fs.writeFileSync(dir + '/diff.html', diffHTML);
				fs.writeFileSync(dir + '/local.json', localString);
				fs.writeFileSync(dir + '/remote.json', onlineString);

				var diffs = compare(localString, onlineString);
				if(diffs.length) {
					console.log('有' + diffs.length + '项差异');
				} else {
					console.log('恭喜你，没有差异，比对');
				}

			} catch(e) {
				console.log(e);
				
			} 
		}
	}


}

// 下面的才是好戏呢