module.exports = [
	// {
	// 	"route": "/about/copyright.php",
	// 	"data": {
	// 		"name": "oboa-a"
	// 	},
	// 	"host": /.+\.taobao\.com/i,
	// 	"json": "#mock/copyright.json",
	// 	"jsData": "#mock/myconfig.js",
	// 	"responseTime": 500,
	// 	"remote": "http://dip.alibaba-inc.com/api/v2/services/schema/mock/3828"
	// },
	{
		"route": /api\/getUserName\/\d+/i,
		"jsData": "./myconfig.js"
	},
	// {
	// 	"route": "/about/copyright.php",
	// 	"remote": "http://dip.alibaba-inc.com/api/v2/services/schema/mock/3828"
	// },
	// {
	// 	"dipSchema": 4879,
	// },
	// {
	// 	"dipApp": 2361,
	// },
	// 
	
	// api.m.taobao.com/operate/*
	{
		"route": /\/operate\/.*/i,
		"json": "mock/operate.json"
	},

	// 为api.m.taobao.com下的API兜底
	{
		"route": /.*/i,
		"host": "api.m.taobao.com",
		"jsData": "mock/myconfig.js",
		"priority": ""
	},

	{
		"route": "/operate/xxx.json",
		"json": "mock/operate.json"
	},

	// api.m.taobao.com/bbb.json
	{
		"route": "/bbb.json",
		"host": "api.m.taobao.com",
		"json": "mock/copyright.json"
	},

	{
		"route": "/h5/mtop.taobao.freeway.sellerreport.getshopstatistic/1.0/",
		"remote": "self"
	},
	{
		"route": "/aaa.json",
		"json": "mock/copyright.json"
	}
]

// 