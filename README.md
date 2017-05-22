# mockx

mockx - 一个nodejs编写的http|https代理服务器。只需简单的配置就能实现复杂的代理需求。
可以用来做数据mock，线上资源代理等。

Features:

- 替换远程请求到本地文件
- 支持反向代理
- 模拟慢速网络
- 可修改请求头和响应头
- 自动创建证书
- 支持HTTP和HTTPS

# Table of Contents 

<!-- MarkdownTOC -->

- 工作原理
- Example & Usage
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

## 工作原理

```
time ==>
-----------------------
server:       4
-------------/-\-------
hoxy:       3   5
-----------/-----\----
hosts:    2       \
---------/---------\---
client: 1           6
```

1. 客户端发起请求 
2. hosts文件返回IP 127.0.0.1
3. 到监听80端口的mockx服务，查找匹配的规则再转给服务器或本地
4. 服务器端收到请求并发送响应数据
5. mockx接收并加工数据
6. 客户端收到响应内容

注：

- mockx是运行在本地80端口的服务器，即127.0.0.1:80
- mockx在有域名映射时，会修改hosts文件添加域名映射到127.0.0.1

## Example & Usage

完整的项目请见[mockx-example](https://github.com/zzuhan/mockx-example)

项目的目录结构如下

<img src="//img.alicdn.com/tfs/TB1NctDRpXXXXaTXFXXXXXXXXXX-466-752.png" alt="项目目录结构" style="width: 200px;"/>

1 安装mockx

`npm install mockx`

2 启动mockx

在项目根目录下执行`sudo node_modules/.bin/mockx`

因为mockx是监听在80端口，因此要使用`sudo`权限。

如果第一次执行，会在项目根目录下创建`mockx.config.js`，即mockx的配置文件。

3 修改`mockx.config.js`配置文件

```js
module.exports = {
	// 
	// 需要代理的域名
	// 
	domains: [
		's.taobao.com'
	],

	// 
	// mock文件夹
	//
	mockDir: './mock',

	// 
	// 所有的映射规则，详见后面rule编写规则
	// 
	rules: [

		// 映射本地json
		{
			pathname: '/mockJSON',
			json: 'jsonfile.json'
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
		}
	]
}
```

4 访问

`http://localhost/mockJSON`或`s.taobao.com/mockJSON`都将返回`mock/jsonfile.json`内容

## Use Cases

下面默认的配置是这样的，因此只写了rules 

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

一般webpack开发是在`8080`端口，通过`localhost:8080/index.html`来调试。

当需要mock`/api/message/list`这样的接口时。我们的思路是都通过localhost来访问，未命中的地址再转发到`localhost:8080`。

因此我们就通过访问`localhost/index.html`来测试。

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

替换线上的某个url下内容，排查线上的bug。如`https://s.taobao.com/search?q=40530`

注：

- 此时需要在domains里添加一条host`s.taobao.com`，mockx启动时会自动在hosts文件中添加一条`127.0.0.1 s.taobao.com`


```js
{
	domains: [
		's.taobao.com'
	],
	rules: [
	{
		pathname: '/search',
		file: 'search.html'
	},	
	{
		pathname: /.*/,
		remote: 'origin' // origin即原封不动转发，访问`s.taobao.com/api/message`会转到线上真正的`s.taobao.com/api/message`服务
	}]
}
```

### 同时代理一批接口

`/api/message/list`，`/api/message/create`，`/api/message/get`这样一批接口需要代理。我们的pathname支持正则，同时在响应字段中有`$n`代表正则里的`()`分组正则表达式在url里匹配到的内容。

```js
{
	rules: [
	{
		pathname: /\/api\/message\/(.*)/i,
		file: '$1.html'
	}
}
```

访问`/api/message/list`会映射到本地的`mock/list.json

### query不同返回不同内容

有时需要根据query不同来返回不同内容，使用query字段。

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

指定响应头，如静态资源跨域的`Access-Control-Allow-Origin`。

指定请求头，如在本地模拟登陆的用户信息`cookie`

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
