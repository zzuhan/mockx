module.exports = [
	{
		"route": "/about/copyright.php",
		"json": "#mock/copyright.json",
		"jsData": "mock/myconfig.js",
		"data": {
			"name": "oboa-a"
		},
		"responseTime": 1000
	},
	{
		"route": /api\/getUserName\/\d+/i,
		"jsData": "./myconfig.js"
	}
]