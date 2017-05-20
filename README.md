# 是什么

本地的资源代理工具

# example

1 项目根目录下创建`mockx.config.js`

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

2 安装执行

`npm install mockx`
`node_modules/.bin/mockx`

3 访问

`http://localhost/getJSON`或`freeway.ju.taobao.com/getJSON`都将返回jsonfile.json内容

# 核心理念

平时开发过程中必须的一环就是数据的mock，为了对代码没有侵入，mockx采用了独立服务的形式来实现。其实就是开启了一个反向代理服务器，所有的请求都走mockx服务器，根据编写的规则，mockx服务器再决定将请求转发到哪里。

经过了长时间的打磨，提炼，功能已经非常丰富，满足你能想到和想不到的场景。

默认是占用80端口，默认是localhost访问，如果是其他域名的，需要编写domains字段，mockx会帮助你修改/etc/hosts自动映射到mockx服务器。

# use cases

## webpack本地开发

webpack是启动在8080端口，需要mock一些数据

```js
{
	rules: [
	{
		route: '/api/message/list',
		file: 'messageList.json'
	},	
	{
		route: /.*/,
		host: 'localhost',
		remote: 'localhost:8080$0'
	}]
}
```

`localhost/index.html`会转发到`localhost:8080/index.html`
`localhost/api/message/list`会转发到`mock/messageList.json`

## 替换线上的某个url下内容

替换线上的某个url下内容，排查线上的bug。
如`https://s.taobao.com/search?q=40530`
```js
{
	domains: ['s.taobao.com'],
	rules: [
	{
		route: '/search',
		file: 'search.html'
	},	
	{
		route: /.*/,
		remote: 'origin'
	}]
}
```

## 同时代理一批接口

`/api/message/list` `/api/message/create`  `/api/message/get` 下会有一批接口

使用route支持正则的特性

```js
{
	rules: [
	{
		route: '/\/api\/message\/(.*)/i',
		file: '$1.html'
	}
}

访问`/api/message/list`会映射到本地的`mock/list.json

## 接口数据的随机mock

json字段时，底层自动支持了mockjs，只要按mockjs的规则写json就可以了。

## query不同返回不同内容

{
	rules: [
	{
		route: '/api/message/create',
		data: {
			title: 'xxx'
		}
		json: 'success.json'
	}, 
	{
		route: '/api/message/create',
		data: {
			title: 'xxxxxxxxxxxxxxxxxxxxx'
		},
		json: 'error.json'
	}
}

## 指定发送的headers或者返回的headers

转发到`http://taobao.com/api/message/create`服务器时headers上会带上cookie，并且返回的headers上会带上`"Access-Control-Allow-Origin`

{
	rules: [
	{
		route: '/\/api\/message\/(.*)/i',
		remote: 'http://taobao.com/api/message/create'
		"headers": {
			"Access-Control-Allow-Origin": "*"
		}
		"requestHeaders": {
			"cookie": "NID=102=W21YoOeFkN6ndgJ_ZPQfa12YpMYdLm8Oxcy_QBg5zyQILhQDDhWdWMFBeyzZQmo8FsuykQNCJezRN_WfJ9m9e644dkd9_nH1yVbk2B9LvhL8hYpufpYe39VFvfcKHBa6DzTKKeije1Adlrrf3nw36LMPkDrYA1e1xG4lV4Inr05TCzIzQ6VJcTKudZtY27Kp; DV=UtKgBvHhB6IVLh52YHJ4EGP2UPZItwI; UULE=a+cm9sZToxIHByb2R1Y2VyOjEyIHByb3ZlbmFuY2U6NiB0aW1lc3RhbXA6MTQ5MzExMzE4ODQwOTAwMCBsYXRsbmd7bGF0aXR1ZGVfZTc6MzAyODE4MDY0IGxvbmdpdHVkZV9lNzoxMjAwMTkwNjEyfSByYWRpdXM6MTA3MjYw"
		}
	}
}

# Options说明

# Options.rule说明

请求有关的字段

- *route* 匹配的url路径，支持正则和字符串。
- *url* 完整的url
- *data* 匹配的get或post的数据，post字段覆盖get字段，如果填了在query也匹配时才会命中此配置。注:data中k-v的value必须是字符串。
- *host* 匹配的host

响应有关的字段

- *json* 映射的json文件 json文件支持mockjs
- *jsData* 映射的动态执行的js文件
- *remote* 映射的远程资源 映射时请写全带上协议，如`http://taobao.com`
- *file* 映射的静态文件，可以是`html`, `js`, `css`
- *dipSchema* 
- *dipApp*

辅助的字段

- *jsonp* jsonp请求，字段value是jsonp的字段名如`{jsnop: 'callback'}`
- *delay* 延时的响应时间，毫秒单位



# mockx.config.js说明

## domains

需要映射的域名

## rules

所有的映射规则，下面会有rule的详细说明

## mockDir

mock的文件夹

# rule说明

## 请求匹配

`host` `data` `route` `url` 字段

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

