[
	// 基础用法
	// =====================================

	// 简单的json文件
	{
		"route": "/api/userinfo",
		"json": "userinfo.json"
	},

	// 当需要jsonp类型
	{
		"route": "/api/userinfo",
		"json": "userinfo.json",
		"jsonp": "callback"
	},

	// 简单的jsData
	{
		"route": "/api/userinfo",
		"jsData": "userinfo.js"
	},

	// 简单的remote
	{
		"route": "/api/userinfo",
		"remote": "http://dip.alibaba-inc.com/api/v2/services/schema/mock/7222"
	},

	// 正则支持
	{
		"route": /\/api\/(\d{5,10})\/userinfo/i,
		// $1 匹配上面第一个匹配的
		"json": "mock/mocktest/$1.json"
	},

	// 一些场景
	// =====================================


	// 场景1 某个专做数据接口的域名，新开的项目某个接口后端还在开发中，需要此接口走本地，其余接口都走线上
	// 需要api.m.taobao.com 指向127.0.0.1 在 flex-hosts.json中 "127.0.0.1"下添加 "freeway.ju.daily.taobao.net" 这一项
	{
		"route": /.*/i,
		"host": "api.m.taobao.com",
		"remote": "self"		
	},

	{
		"route": "/get/userinfo",
		"host": "api.m.taobao.com"
	},

	// 场景2 dip schema
	// 注：在dip上schema填写时，必须要有meta.uri字段，即设定 接口地址
	{
		dipSchema: 5158
	},
	// 转义为
	{
	    "route": "/api/getActivitySignListWithBrand",
	    "host": "localhost",
	    "remote": "http://dip.alibaba-inc.com/api/v2/services/schema/mock/5158",
	    "dipSchema": 5158,
	    "responseTime": 1000
  	},

	// 场景3 dip app
	// 一个集中的app，其内包含很多dip schema，也必须场景2的dip schema
	{
		dipApp: 3333
	},

	// 附加功能展示
	{
		// 模拟后端数据延时
		responseTime: 1000
		// 设定接口返回的charset
		charset: 'utf8'
	},

	// 修改headers (还未实现)
	{
		route: '',

		headers: {
			cookie: {
				'uid': 111
			}
		}
	},

	// 指定data 即url中的query或body中post的数据，当get和post都含某个字段时，post字段数据覆盖get字段数据
	// data设定k-v时，value必须是字符串
	{
		route: 'api.taobao.com/userinfo',
		data: {
			uid: '7788'
		},
		json: 'mock/7788.json'
	},

	// 其它mock文件
	{
		route: 'front/floorConfig.htm',
		file: 'mock/floorConfig.html',
		// 这个必填
		fileType: 'text/html'
	}
]