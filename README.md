MockX

目前包含了 middleware, mock 两种类型

# mock 类库

```
require('mockx').mock(tpl[, data]);

// 基础用法
var userInfo = require('mockx').mock({
	"name": "xxx",
	"avatar": "@image(200x200)",
	"age|1-100.1-10": 2,
	"blog": "@url"
});

// 支持模板的用法
var userInfo = require('mockx').mock({
	"name": "${query.name}",
	"avatar": "@image(200x200)",
	"age|1-100.1-10": 2,
	"blog": "@url"
}, {
	query: {
		name: 'han'
	}
});

```

# middleware

配合express的中间件。

支持3种文件类型，json，jsData，remote

## usage

1. 调用middleware
	require('mockx')(params, confDir);

2. mockx.json配置文件

## mockx.json配置文件

```
路径为 confDir/mockx.json

[
	{
		"route": "/about/copyright.php",
		"query": ""
		// 如果是jsonp请求，则添加
		"jsonp": "callback",
		"json": "mock/copyright.json",
		// value前加#表示停用
		"jsData": "#mock/myconfig.js",
		"remote": "#http://baidu.com"
	}
]

## 前提条件

假设你传的req，会经过解析成类似express的。  
query在req.query中  
post的数据在req.body中。  
data的匹配中，post会覆盖query

## jsData

```

# 开发计划

- remote转发(proxy)到线上服务器的数据
- 可以添加cookie字段，或者是trasnsparent的转发

- query字段，改成data更好，同时支持post和get