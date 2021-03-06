// 1 测试Mock做为独立项目配置

var MockMiddleware = require('../index');

// var req = {
// 	url: 'http://www.taobao.com/about/copyright.php?callback=123&name=oboa-a&action=abc',
// 	body: {
// 		token: 'xxx'
// 	},
// 	headers: {
// 		cookie: 'xxx'
// 	},
// 	query: {
// 		callback: 123,
// 		name: 'oboa-a',
// 		action: 'abc'
// 	},
// 	// 把cookie搞到这一层
// 	cookies: {
// 		id: '1818'
// 	}sortArray
// }

// var req = {
// 	url: '/bbb.json',
// 	query: {
// 		age: -1,
// 		name: 'han',
// 		callback: 'mtop5'
// 	},
// 	body: '',
// 	connection: {
// 		encrypted: true
// 	},
// 	headers: {
// 		host: 'api.m.taobao.com'
// 	}
// }

// route被正则命中
var req = {
	url: '/diff/list',
	query: {
		age: -1,
		name: 'han',
		callback: 'mtop5',
		path: 'freeway.ju.daily.taobao.net/message/queryMessageDetail.do'
	},
	body: '',
	connection: {
		encrypted: true
	},
	headers: {
		host: 'api.m.taobao.com'
	}
}

var res = {
	writeHead: function () {
		// console.log(arguments);
	},
	// 用来模仿res.write时，查看结果
	write: function (res) {
		console.log(res.toString());
	},
	end: function (res) {
		console.log(res.toString());
	}
}

var next = function(){
	
}

console.log(process.cwd());

var handle = MockMiddleware({
	hosts: {}
}, '/Users/hanwencheng/work/mockx/test/');
handle(req, res, next);

// 2 测试Mock作为一个API使用