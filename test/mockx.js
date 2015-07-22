module.exports = [
	{
		"route": "/about/copyright.php",
		"json": "mock/copyright.json",
		"data": {
			"callback": "123"
		},
		"responseTime": 1000
	},
	{
		"route": /api\/getUserName\/\d+/i,
		"jsData": "./myconfig.js"
	}
]