# 是什么

本地的资源代理工具

# example

1 根目录下创建`mockx.config.js`

```js
module.exports = {
	// 填写要转发的域名，默认只跑在80端口，即使用localhost访问
	domains: [
		"freeway.ju.taobao.com"
	],

	projectIds: [],

	// 相对项目根目录下的mock文件夹
	mockDir: './mock',

	// 所有的映射规则，详见后面rule编写规则
	rules: [
	
	// 映射本地json
	{
		route: '/mockJSON',
		json: 'jsonfile.json'
	}, 

	// 映射本地js逻辑返回动态内容
	{
		route: '/mockJSData',
		jsData: 'jsData.js'
	}, 

	// 映射本地的静态文件
	{
		route: '/mockFile',
		file: 'file.html' // file静态资源，可以是js，css，html
	}, 

	// 映射一个远程的内容
	{
		route: '/mockRemote',
		remote: 'http://www.taobao.com' // remote需要写全，把协议http:带上
	}, 

	// 映射一个jsonp
	{
		route: '/mockJSONP',
		json: 'jsonfile.json',
		// 这个是 
		jsonp: 'callback'
	}, 

	// dipSchema
	{
		dipSchema: 59002
	}, 

	// dipApp
	{
		dipApp: 2313
	}, 

	// 正则匹配，通过匹配多个url
	{
		route: /\/api\/message\/(.*)/i,
		json: 'message/$1.json' // $1即上面正则匹配的$1
	},

	// 下面两个规则 1 映射单一接口，剩余的全部再转发到线上
	{
		route: '/ju/seal/app.js',
		host: 'g.alicdn.com',
		remote: 'http://localhost:8000/app.js'
	},
	// 2 剩余的接口原封转发
	{
		route: /.*/,
		host: 'g.alicdn.com',
		remote: 'origin'
	}]
}
```

2 根目录下执行

`node_modules/.bin/mockx`

3 访问

`http://localhost/getJSON`或`freeway.ju.taobao.com/getJSON`都将返回jsonfile.json内容

# mockx.config.js说明

## domains

需要映射的域名

## rules

所有的映射规则，下面会有rule的详细说明

## mockDir

mock的文件夹

# rule说明

## 请求匹配

`host` `data` `route` 字段

## json

映射json文件

访问 `localhost/mockJSON`

## file

映射静态文件

`localhost/mockFile`

## remote 

映射某url地址

`localhost/mockRemote`

## jsdata

js逻辑动态输出内容

## jsonp

访问`/mockJSONP?callback=abc123`

## 正则

访问`/api/message/create` 会访问本地`/mock/message/create.json

## 映射某一单一的接口

## dipApp

## dipSchema

# 启动

1 安装mockx

`npm install mockx 

2 启动mockx

在项目根目录下执行

`node_modules/.bin/mockx`

初次会自动创建一个mockx.config.js即配置文件。

# 分割线

----------------------------------------------------------------------

后面的文档暂时还未写好

# 如何写mockx.config.js

```
module.exports = {
  // 填写要转发的域名
  domains: [
    
  ],
  projectIds: [],
  // 相对项目根目录下的mock文件夹
  mockDir: './mock',
  // 所有的映射规则
  rules: [{
    route: '/mockJSON',
    json: 'jsonfile.json'
  },{
    "route": "/product/getCorpProducts.do",
    "data": {
      "mainProductId": "4"
    },
    "json": "getCorpProducts.json"
  }]
}

```

尝试访问`localhost/mockJSON` 会读取`项目根目录/mock/jsonfile.json`文件。

# rule规则

| 字段        | 描述           | 类型  |
| ------------- |:-------------:| -----:|
| route     | 匹配的url路径 | String|Regexp 必填 |
| url| 完整的url |  String | 
| data | 匹配的get或post的数据，post字段覆盖get字段，如果填了在query也匹配时才会命中此配置。注:data中k-v的value必须是字符串  |   Object 可选 |
| host | 匹配的host，如果填了在host也匹配时才会命中此配置  |    String 可选 |
| json      | 映射的json文件     | String   |
| jsData | 映射的js文件      |    String |
| remote | 转发请求的url, 值填`self`表明透明转发到线上相同url     |    String |
| jsnop | 如果是jsonp请求，url中jsonp的字段名      |    String |
| delay/responseTime |  加入延时响应时间  |    Number |
| dipSchema|  DIP Schema的ID  |    Number |
| dipApp|  DIP App的ID  |    Number |
| charset| 返回结果的charset，默认按读取的文件或remote接口的charset |  String |

# 规则的编写

可分为三部分，匹配规则，响应规则和辅助的

## 匹配规则

匹配规则只需部分匹配即可，route是必填的，如果你需要更精确的就填写准确一点。

遵循[nodejs url objects](https://nodejs.org/api/url.html#url_url_strings_and_url_objects)

- url 即完整的
- route 支持正则 即pathname
- host 即host
- data 即query部分，不过是个object

例如

`http://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash`
```
{
	"url": "http://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash",
	"route": "/p/a/t/h",
	"host": "sub.host.com:8080",
	"data": {
		"query": "string"
	}
}

```

## 响应规则

json
file
jsData

## 辅助的

请求头
响应头
延时
jsonp
delay

# 常见的场景

某个接口未开发好，映射到本地测试，其余的仍然代理到线上
```
<!-- serch接口代理到本地 -->
{
	"route": "search",
	"json": "search.json"
},
<!-- 其余的代理到线上, origin特指原封不动的转发到线上 -->
{
	route: /.*/,
	remote: 'origin'
}

```

将/api/message全部代理到本地的message目录，其余扔走线上，正则匹配，$1即是上面匹配的括号
```
{
	"route": /api\/message/(.*),
	"json": "$1.json"
}, 
{
	route: /.*/,
	remote: 'origin'
}

```


# 带注释的example

`http://www.taobao.com/search?key=aaa`

{
	<!-- 用来匹配的项 -->
	"url": "http://www.taobao.com/search?key=aaa",
	<!-- 支持正则 -->
	"route": "/search", 
	<!-- 请求的数据 -->
	"data": {
		"key": "aaa"
	},
	<!-- 域 -->
	"host": "www.taobao.com",
	<!-- json文件 -->
	"json": "search.json",
	<!-- 动态的js -->
	"jsData": "search.js",
	<!-- 远程的一个地址，origin则会透明转发 -->
	"remote": "http://www.tmall.com/search?key=aaa",
	<!-- 如果是jsonp -->
	"jsonp": true,
	<!-- 延时 -->
	"delay": 1000,
	<!-- 响应的头 -->
	"headers": {
		"Access-Control-Allow-Origin": "*"
	}
	<!-- 请求的头 -->
	"requestHeaders": {
		"cookie": "NID=102=W21YoOeFkN6ndgJ_ZPQfa12YpMYdLm8Oxcy_QBg5zyQILhQDDhWdWMFBeyzZQmo8FsuykQNCJezRN_WfJ9m9e644dkd9_nH1yVbk2B9LvhL8hYpufpYe39VFvfcKHBa6DzTKKeije1Adlrrf3nw36LMPkDrYA1e1xG4lV4Inr05TCzIzQ6VJcTKudZtY27Kp; DV=UtKgBvHhB6IVLh52YHJ4EGP2UPZItwI; UULE=a+cm9sZToxIHByb2R1Y2VyOjEyIHByb3ZlbmFuY2U6NiB0aW1lc3RhbXA6MTQ5MzExMzE4ODQwOTAwMCBsYXRsbmd7bGF0aXR1ZGVfZTc6MzAyODE4MDY0IGxvbmdpdHVkZV9lNzoxMjAwMTkwNjEyfSByYWRpdXM6MTA3MjYw"
	}
}


# 文档

想象是一个完全无知的用户，会遇到哪些问题？如何

先介绍清楚是什么东西，anyproxy是什么？一个npm包？帮助解决代理问题。

mockx 本地http代理服务器

快速创建本地代理服务器 