module.exports = [
	{
		"route": "/about/copyright.php",
		"data": {
			"name": "oboa-a"
		},
		"host": /.+\.taobao\.com/i,
		"json": "#mock/copyright.json",
		"jsData": "#mock/myconfig.js",
		"responseTime": 500,
		"remote": "http://dip.alibaba-inc.com/api/v2/services/schema/mock/3828"
	},
	{
		"route": /api\/getUserName\/\d+/i,
		"jsData": "./myconfig.js"
	},
	{
		"route": "/about/copyright.php",
		"remote": "http://dip.alibaba-inc.com/api/v2/services/schema/mock/3828"
	},
	{
		"dipSchema": 4967
	},
	{
		"dipApp": 1
	},
	{
		"route": "xxx"
	}
]

// 