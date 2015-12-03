MockX

目前包含了 middleware, mock 两种类型

注：里面包含了很多我们项目定制的东西在内，是基于express，外部公司慎用

# 是什么

是一个用来做数据映射的中间件，可理解为express的中间件。根据配置文件`mockx.js`的配置，将相应的url返回相应的json, js, 或 remote的数据。还支持方便的配合阿里巴巴中的DIP平台。

# 使用

简单的mockx配置文件`mockx.js`事例.配置文件写法是Nodejs的CMD风格js文件，用module.exports输出一个数组对象。


```
// mockx.js
module.exports = [{
	"route": "/api/getUserInfo",
	"json": "mock/getuserinfo.json"
}, {
	"route": "",
	"jsonp": ""
}]
```
## Mockx配置项对象

| 字段        | 描述           | 类型  |
| ------------- |:-------------:| -----:|
| route     | 匹配的url路径 | String|Regexp 必填 |
| data | 匹配的get或post的数据，post字段覆盖get字段，如果填了在query也匹配时才会命中此配置  |   Object 可选 |
| host | 匹配的host，如果填了在host也匹配时才会命中此配置  |    String 可选 |
| json      | 映射的json文件     | String   |
| jsData | 映射的js文件      |    String |
| remote | 转发请求的url, 值填`self`表明透明转发到线上相同url     |    String |
| jsnop | 如果是jsonp请求，url中jsonp的字段名      |    String |
| delay/responseTime |  加入延时响应时间  |    Number |
| dipSchema|  DIP Schema的ID  |    Number |
| dipApp|  DIP App的ID  |    Number |
| charset|  返回结果的charset，默认按读取的文件或remote接口的charset |  String |


注：

- 用来限制的字段有三个: `route`, `host`, `query`,  在`host``query`不填的时候，相当于是忽略，只要其他匹配就通过
- 数据映射的字段有三个: `json`, `jsData`, `remote`
- `jsonp` 只在 `json` 和 `jsData`时生效
- query的匹配是部分匹配就可以通过，比如实际的query是`{uid:123, uuid:1123}` 填query`{uid:123}`就算匹配。

## 实例说明

```
请求了一个url http://xxx.xxx.com/api/getUserInfo?uid=123213&jsonp=123123

则 `host: xxx.xxx.com`, `route: /api/getUserInfo`, `query: {uid: 123213, jsonp:123123}` , `jsonp: jsonp`

```

# 注

- DIP的配置(route)不是每次都去拉取，只在第一次会拉取(性能原因)，所以如果远程有更改，需要重新启动clam

# Features

- delay 延时
- DIP

# 一些不太确定的点 纠结

- 现在的remote被我拦截了，中间加了些处理，并不是直接把remote的原封结果返回
- 关于charset 最终返回的charset是按照读取到的文件或者远程接口的charset还是统一utf8呢

# 一些说明

## route匹配原则

字符串 > 正则
先出现的 > 后出现的

## 文件的路径

本地路径的书写格式，只支持相对路径，是相对于此项目的根目录

# 一些常用场景

## 场景1 只映射某域下的某个接口

需求：只映射"api.xxx.com" 域下的"/getUserInfo"接口，其余都转发线上

```
[{
	route: /.*/i,
	host: 'api.xxx.com',
	remote: 'self'
},
{
	route: '/getUserInfo',
	host: 'api.xxx.com',
	json: "mock/getUserInfo.json"
}]

```

# 一些问题

- 


# 策略

remote 场景 同域下一部分接口需要拿线上的
jsData 有一些复杂逻辑处理的
json 固定结构的json数据，数据的值可以指定某些类型

remote直接原封返回包括headers和body，其实是要做透明代理。对于请求，也要原封的使用req的headers和body

关于一个http response的组成：
	1 headers
	2 body


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

# Features

- 透明代理(某个域名下的接口，如api.wapa.taobao.com，新接口在开发中，需要映射到本地，但是老接口需要转发到线上)
	query, headers信息都会透明转发到线上


# 注意事项

- 运行时修改或添加或删除dipSchema或dipApp都需要重新启动服务
- 

# 开发计划

- 关于remote
	流程图，设计图，remote是否直接做透明转发而不是现在做这么多处理，太麻烦了

- DNS检查，如果处于

- cache机制，想覆盖dipSchema的一些字段如何做？比如host写为空的

- 支持DIP projectId

- remote转发时，带上headers和支持POST请求

- 可以添加cookie字段，或者是trasnsparent的转发

- 是否要加 type，因为RESTFUL的化，接口地址是一致的，通过type来区分

# Change Log

## [0.6.0]

大改版，代码进行了重构，解决了编码问题和dip在网络不通下的问题

### Added

- postProcess功能

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