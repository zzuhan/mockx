// 这个是比对的js文件
var compare = require('./compare');

module.exports = function compareWrap(local, online) {

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
			console.log('done');
			compare(localString, onlineString);
		}
	}


}

// 下面的才是好戏呢