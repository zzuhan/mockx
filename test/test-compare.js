var fs = require('fs');

var compare = require('../lib/compare-wrap');

var local = fs.readFileSync('./mock/local.json').toString();
var remote = fs.readFileSync('./mock/remote.json').toString();

var req = {
	url: '/api/userinfo?name=ryan',
	headers: {
		host: 'www.taobao.com'
	}
}

var path = require('path');

compare(local, remote, req, {
	mockDir: path.join(process.cwd(), 'mock')
});