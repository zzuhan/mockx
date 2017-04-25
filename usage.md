# API

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

# 

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

# 常见的场景

某个接口未开发好，映射到本地测试
```
{
	"route": "search",
	"json": "search.json"
},
{
	route: /.*/,
	remote: 'origin'
}

```
