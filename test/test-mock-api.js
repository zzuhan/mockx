// 作为一个简单的API
// 经过mockjs

var Mock = require('../index');

var data = {
	query: {
		name: 'han'
	}
}

var tpl = {
	"name": "${query.name}",
	"avatar": "@image(200x200)",
	"age|1-100.1-10": 2,
	"blog": "@url"
}

var ret = Mock.mock(tpl, data);
console.log(ret);