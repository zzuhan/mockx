[
	// 基础用法
	// =====================================

	// 简单的json文件 返回json数据
	{
		"route": "/api/userinfo",
		"json": "userinfo.json"
	},

	// 当需要jsonp类型 返回自动包裹jsonp格式
	{
		"route": "/api/userinfo",
		"json": "userinfo.json",
		"jsonp": "callback"
	},

	// 简单的jsData 返回jsData执行的返回值 
	{
		"route": "/api/userinfo",
		"jsData": "userinfo.js"
	},

	// 简单的remote 返回远程remote返回的数据
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


	// 场景1 某个专做数据接口的域名，新开的项目某个接口后端还在开发中，需要此接口映射本地，其余接口都走线上
	// 需要api.m.taobao.com 指向127.0.0.1 在 flex-hosts.json中 "127.0.0.1"下添加 "freeway.ju.daily.taobao.net" 这一项
	{
		// '/.*/i' 正则意为所有
		"route": /.*/i,
		"host": "api.m.taobao.com",
		// 'origin' 透明转发，即转发到线上的服务器
		"remote": "origin"		
	},

	{
		// route规则中，字符串 > 正则，因此'api.m.taobao.com/get/userinfo'会匹配到这个规则，而不是上面的正则设定
		"route": "/get/userinfo",
		"host": "api.m.taobao.com",
		"json": "mock/userinfo.json"
	},

	// 场景2 dip schema
	// 注：在dip上schema填写时，在schema源码中必须要有meta.uri字段，通过 编辑 -> meta -> 接口地址 设置
	{
		dipSchema: 5158,
		responseTime: 1000
	},
	// 转义为
	{
	    "route": "/api/getActivitySignListWithBrand",
	    "host": "localhost",
	    "remote": "http://dip.alibaba-inc.com/api/v2/services/schema/mock/5158",
	    "dipSchema": 5158,
	    "responseTime": 1000
  	},

  	// 场景3 线上HTML出问题，暂时没修改vm，想直接修改线上HTML测试下问题
  	// 映射其余到线上
  	{
  		"route": /.*/i,
  		"host": "ju.taobao.com",
  		"remote": "origin"
  	},
  	// https://ju.taobao.com/tg/brand_items.htm?act_sign_id=14541818&seller_id=749901026
  	{
  		"route": "/tg/brand_items.htm",
  		"data": {
  			"act_sign_id": 14541818
  			"seller_id": 749901026
  		},
  		"host": "ju.taobao.com",
  		"file": "mock/html/brand_items.htm",
  		"fileType": "text/html"
  	},

  	// 场景4 不同的query返回不同的内容
  	{
  		"route": "/tg/get_good_info.htm",
  		"data": {
  			"itemId": -1
  		},
  		"json": "mock/json/get_good_info_fail.json"
  	},

  	{
  		"route": "/tg/get_good_info.htm",
  		"data": {
  			"itemId": 1234567
  		},
  		"json": "mock/json/get_good_info_success.json"
  	},

  	// 场景5 一个list数据，不想每页的数据都是一样的
  	{
  		"route": "/tg/get_items.htm",
  	}


	// 场景3 dip app
	// 一个集中的app，其内包含很多dip schema，dip schema必须遵守场景2中dip schema说明
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
	}
]