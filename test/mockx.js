module.exports = [
	{
		"route": "/about/copyright.php",
		"data": {
			"name": "oboa-a"
		},
		"host": /.+\.taobao\.com/i,
		"json": "#mock/copyright.json",
		"jsData": "mock/myconfig.js",
		"responseTime": 500
	},
	{
		"route": /api\/getUserName\/\d+/i,
		"jsData": "./myconfig.js"
	}
]