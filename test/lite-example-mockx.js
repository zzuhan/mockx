// 精简版本的mockx使用
// 数组对象，每个对象表示一条规则，只要现有的规则匹配了就算命中

[

// 场景1 
// 1 映射 api.taobao.com/items/list?page=1&callback=mtop 到本项目的mock/itemslist.json文件
// 2 api.taobao.com域名下其它所有请求都透明代理，即到线上服务器
{	
	// 路径
	"route": "/items/list",
	// host
	"host": "api.taobao.com",
	// 说明是jsonp，jsonp的字段是callback
	"jsonp": "callback",
	"data": {
		"page": 1
	},
	// 匹配当前项目下的mock/itemslist.json文件
	"json": "mock/itemslist.json"
},
{
	"route": /.*/,
	"host": "api.taobao.com",
	"remote": "origin"
}

// 场景2 映射



// 场景3 


]


