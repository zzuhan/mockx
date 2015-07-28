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
路径为 confDir/mockx.js

module.exports = [
	{
		"route": "/about/copyright.php",
		"data": {}
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

# 注意事项

- 运行时修改或添加或删除dipSchema或dipApp都需要重新启动服务
- 

# 开发计划

- cache机制，想覆盖dipSchema的一些字段如何做？比如host写为空的

- 支持DIP projectId

- remote转发时，带上headers和支持POST请求

- 可以添加cookie字段，或者是trasnsparent的转发


- 是否要加 type，因为RESTFUL的化，接口地址是一致的，通过type来区分

# Change Log

## [0.4.0]

### Added

- 可以设置DIP schema，自动获取相应的配置

## [0.3.2]

### Added

- 添加了host匹配功能

## [0.3.0]

### Added

- data匹配功能，替代之前的query匹配，同时支持了get和post方式

## [0.2.0]

### Changed

- route和query同时支持正则和字符串
- 配置文件从json改为node模块