// 1 测试Mock做为独立项目配置

var MockMiddleware = require('../index').middleware;

var req = {
	url: 'http://www.taobao.com/about/copyright.php?callback=123&name=oboa-a&action=abc',
	body: {
		token: 'xxx'
	},
	headers: {
		cookie: 'xxx'
	},
	query: {
		callback: 123,
		name: 'oboa-a'
	},
	// 把cookie搞到这一层
	cookies: {
		id: '1818'
	}
}

var res = {
	writeHead: function () {
		// console.log(arguments);
	},
	write: function (jsonContent) {
		console.log(jsonContent);
	},
	end: function () {
		// console.log(arguments);
	}
}

var next = function(){

}

var handle = MockMiddleware({
	hosts: {}
}, '/Users/hanwencheng/work/mockx/test/');
handle(req, res, next);

// 2 测试Mock作为一个API使用


