# 是什么

http https 反向代理工具。可以理解为charles，拦截你电脑上的请求，然后返回你指定的内容。

比如说 `www.taobao.com/api/xxx` 这样的一个接口，后端还没开发好，这时你可以通过proxyx把这个接口的返回指向本地的一个 xxx.json文件，让流程走通。

这里画一个流程图来方便的介绍

## 开发过程中遇到的一些问题

- 开发过程中，后端还没开发好的某个接口
- 线上的某个html页面，你想插入一个脚本或修改某段代码做调试
- 接口的返回内容从写好的dip平台拉取

下面是高级mock功能

- 需要模拟大数据量的数据，并且每个数据又不太一样。
- 返回的结果跟请求的request参数有关

下面是compare功能

- 后端开发好接口后，因为后端的接口跟你本地mock的数据，稍有差异，导致你的页面运行不起来。

共享平台(还在开发中)

- 可以后端来写proxy的规则
- 后端数据接口设计有变动，他可以直接来修改相应的数据，并且前端可以看到修改的记录和比对。

## 规则编写文件

```
module.exports = {
	"domains": [],
	// 将来对接mock平台的项目id, 暂时未开放
	"mockIds": [],
	"rules": [{
		route: '/mockJSON',
		json: 'jsonfile.json'
	}, {
		route: '/mockFile',
		file: 'file.html'
	}, {
		route: '/mockJsData',
		jsdata: 'jsdata.js'
	}],
	// "compare": true,
	"mockDir": "../mock"
}
```

| 字段        | 描述           | 类型  |
| ------------- |:-------------:| -----:|
| domains | 需要反代的域名 | Array |
| mockIds | mock平台的projectId |   Array |
| mockDir | 相对的mock文件夹 | String |
| rules | 最重要的你要映射的规则 | Array |

## rules中字段的含义

rules的字段，主要是几类字段组成的，request类，response类还有helper类

## request类

| 字段        | 描述           | 类型  |
| ------------- |:-------------:| -----:|
| route     | 匹配的url路径 | String|Regexp 必填 |
| data | 匹配的get或post的数据，post字段覆盖get字段，如果填了在query也匹配时才会命中此配置。注:data中k-v的value必须是字符串  |   Object 可选 |
| host | 匹配的host，如果填了在host也匹配时才会命中此配置  |    String 可选 |

## response类

| 字段        | 描述           | 类型  |
| ------------- |:-------------:| -----:|
| json      | 映射的json文件     | String   |
| jsontext  | 映射的json字符串    | String   |
| jsdata | 映射的js文件      |    String |
| file | 映射的文件(可以是html，图片等) | String |
| http | 返回http的状态      |    Object |
| remote | 转发请求的url, 值填`self`表明透明转发到线上相同url     |    String |
| dipSchema|  DIP Schema的ID  |    Number |
| dipApp|  DIP App的ID  |    Number |
| headers |  支持headr |  String |
| charset|  返回结果的charset，默认按读取的文件或remote接口的charset |  String |
| jsnop | 如果是jsonp请求，url中jsonp的字段名      |    String |

## helper类 

| 字段        | 描述           | 类型  |
| ------------- |:-------------:| -----:|
| delay/responseTime |  加入延时响应时间  | Number |

# 安装和使用

单独使用，请使用[mockx-cli](https://github.com/zzuhan/mockx-cli)来安装

# 简单的例子

通过[mockx-cli](https://github.com/zzuhan/mockx-cli)初始化一个项目来运行把

