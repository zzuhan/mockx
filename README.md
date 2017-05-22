# mockx

mockx - 一个nodejs编写的http|https代理服务器。只需简单的配置就能实现复杂的代理需求。
可以用来做数据mock，线上资源代理等。

Features:

- https自动创建证书
- 静态json集成mockjs功能
- 自动修改hosts实现代理线上服务
- 字符串和正则支持可以实现任何复杂代理需求
- 对代码无侵入
- 数据mock可共享

# Table of Contents 

<!-- MarkdownTOC -->

- Usage
- 核心理念
- Example
- Use Cases
	- webpack本地开发
	- 替换线上的某个url下内容
	- 同时代理一批接口
	- query不同返回不同内容
	- 指定发送的headers或者返回的headers
- Options说明
- Options.rule说明
	- 请求有关的字段
	- 响应有关的字段
	- 辅助的字段

<!-- /MarkdownTOC -->

## Usage

1 安装mockx

`npm install mockx`

2 启动mockx

在项目根目录下执行

`node_modules/.bin/mockx`

3 编写配置文件

初次执行第2步时，会在项目根目录下创建一个`mockx.config.js`. 修改`mockx.config.js`来编写你的规则。

## 核心理念

开发过程中，最头疼的事情就是数据mock，过去的方案要么是修改源代码ajax请求的url，或者是在页面中加一个script拦截ajax，或者charles但是又不能共享。

于是我们通过反向代理服务器的方式，将所有请求到代理服务器，配置代理服务器来决定是走后端的接口，还是mock到本地来实现数据mock, 同时配置文件在项目内，可以随项目共享。

已经在团队内部使用了1年多时间，不断打磨，满足你能想到和未想到的场景。

## Example

完整的项目请见[mockx-example](https://github.com/zzuhan/mockx-example)

1 安装mockx

`npm install mockx`

2 启动mockx

在项目根目录下执行

`node_modules/.bin/mockx`

3 修改根目录下`mockx.config.js`配置文件

```js
module.exports = {
	// 需要映射的域名
	domains: [
		'freeway.ju.taobao.com'
	],

	// 相对项目根目录下的mock文件夹
	mockDir: './mock',

	// 所有的映射规则，详见后面rule编写规则
	rules: [

		// 映射本地json
		{
			pathname: '/mockJSON',
			json: 'jsonfile.json'
		}, 

		// 映射本地js逻辑返回动态内容
		{
			pathname: '/mockJSData',
			jsData: 'jsData.js'
		}, 

		// 映射本地的静态文件
		{
			pathname: '/mockFile',
			file: 'file.html' // file静态资源，可以是js，css，html
		}, 

		// 映射一个远程的内容
		{
			pathname: '/mockRemote',
			remote: 'http://www.taobao.com' // remote需要写全，把协议http:带上
		}, 

		// 映射一个jsonp
		{
			pathname: '/mockJSONP',
			json: 'jsonfile.json',
			// 这个是 
			jsonp: 'callback'
		}
	]
}
```

4 访问

`http://localhost/getJSON`或`freeway.ju.taobao.com/getJSON`都将返回`mock/jsonfile.json`内容

## Use Cases

下面默认的配置是这样的接口，因此只写了rules 

```js
module.exports = {
	// 需要映射的域名
	domains: [
		
	],

	// 相对项目根目录下的mock文件夹
	mockDir: './mock',

	// 所有的映射规则，详见后面rule编写规则
	rules: [
	
	]
}
```

### webpack本地开发

webpack是启动在8080端口，需要mock`/api/message/list`这样的接口。我们的思路是都通过localhost来访问。

```js
{
	rules: [
	{
		pathname: '/api/message/list',
		file: 'messageList.json'
	},	
	{
		pathname: /.*/,
		host: 'localhost',
		remote: 'localhost:8080$0'
	}]
}
```

`localhost/index.html`会转发到`localhost:8080/index.html`
`localhost/api/message/list`会转发到`mock/messageList.json`

### 替换线上的某个url下内容

替换线上的某个url下内容，排查线上的bug。
如`https://s.taobao.com/search?q=40530`

```js
{
	domains: ['s.taobao.com'],
	rules: [
	{
	pathname: '/search',
	file: 'search.html'
},	
{
	pathname: /.*/,
	remote: 'origin'
}]
}
```

### 同时代理一批接口

`/api/message/list` `/api/message/create`  `/api/message/get` 下会有一批接口

使用pathname支持正则的特性

```js
{
	rules: [
	{
		pathname: '/\/api\/message\/(.*)/i',
		file: '$1.html'
	}
}
```

访问`/api/message/list`会映射到本地的`mock/list.json

### query不同返回不同内容

```js
{
	rules: [
	{
		pathname: '/api/message/create',
		query: {
			title: 'xxx'
		},
		json: 'success.json'
	}, 
	{
		pathname: '/api/message/create',
		query: {
			title: 'xxxxxxxxxxxxxxxxxxxxx'
		},
		json: 'error.json'
	}]
}
```

### 指定发送的headers或者返回的headers

转发到`http://taobao.com/api/message/create`服务器时headers上会带上cookie，并且返回的headers上会带上`'Access-Control-Allow-Origin`

```js
{
	rules: [
	{
		pathname: '/\/api\/message\/(.*)/i',
		remote: 'http://taobao.com/api/message/create'
		// 指定响应头
		responseHeaders: {
			Access-Control-Allow-Origin: '*'
		}
		// 指定请求头
		requestHeaders: {
			cookie: 'NID=102=W21YoOeFkN6ndgJ_ZPQfa12YpMYdLm8Oxcy_QBg5zyQILhQDDhWdWMFBeyzZQmo8FsuykQNCJezRN_WfJ9m9e644dkd9_nH1yVbk2B9LvhL8hYpufpYe39VFvfcKHBa6DzTKKeije1Adlrrf3nw36LMPkDrYA1e1xG4lV4Inr05TCzIzQ6VJcTKudZtY27Kp; DV=UtKgBvHhB6IVLh52YHJ4EGP2UPZItwI; UULE=a+cm9sZToxIHByb2R1Y2VyOjEyIHByb3ZlbmFuY2U6NiB0aW1lc3RhbXA6MTQ5MzExMzE4ODQwOTAwMCBsYXRsbmd7bGF0aXR1ZGVfZTc6MzAyODE4MDY0IGxvbmdpdHVkZV9lNzoxMjAwMTkwNjEyfSByYWRpdXM6MTA3MjYw'
		}
	}]
}
```

## Options说明

- **domains** 需要进行代理的域名
- **mockDir** 相对于根目录的mock映射文件夹，一般填入`./mock`
- **rules** 映射的规则 

## Options.rule说明

### 请求有关的字段

- **pathname** 匹配的url路径，支持正则和字符串。即[标准url](https://nodejs.org/api/url.html#url_the_whatwg_url_api)中的pathname一致。要以'/'开头。
- **query** 匹配的get或post的数据，post字段覆盖get字段，如果填了在query也匹配时才会命中此配置。注:(note: query中k-v的value必须是字符串)
- **host** 匹配的host

例如`https://s.taobao.com/search?q=40530`这样解析出来的几部分

`pathname` -> '/search'
`host` -> 's.taobao.com'
'query' -> {q: '40530'}

### 响应有关的字段

- **json** 映射的json文件 json文件支持mockjs
- **jsData** 映射的动态执行的js文件
- **remote** 映射的远程资源 映射时请写全带上协议，如`http://taobao.com`，如果填入`origin`则是原内容转发
- **file** 映射的静态文件，可以是`html`, `js`, `css`

**NOTE**：`json`,`jsData`,`remote`,`file` 在一条规则中只能选其中一个

### 辅助的字段

- **jsonp** jsonp请求，字段value是jsonp的字段名如`{jsnop: 'callback'}`
- **delay** 延时的响应时间，毫秒单位
