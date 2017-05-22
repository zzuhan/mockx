# 第一阶段 完善好用的本地功能 这周结束

- 完善的文档，想想如何写一份公开对外的文档 -> mockx我自己的定位呢，到底是什么呢？
- 插件功能？如果别人的静态资源也有特殊的需求，方案呢？anyproxy的插入方式
	还有可能有特殊的字段需求，比如现在的json, jsdata，想插入一个新的处理逻辑呢
- pac代理？(可选的方式，如果本地有代理工具，就使用pac代理呢) 作为一个可附加的功能吧 暂时不作为一个必须项
	除了会跟本地代理有冲突外，还有其他缺点吗？这些功能都能实现吗？
- flex-hosts用的resolve真的不方便 可以使用pac解决掉 或者还是改成dns.lookup ** 自己用dns.lookup去取到所有的domains配置吧
- 更好用的API是怎么样的？projectIds我现在可以隐匿掉
- 将来整站的开发环境会是如何的，看看别人的webpack开发环境
- 默认不集成dip功能，作为一个插件来开发引入
- 默认不用projectIds，因为功能还没开放

- Features
	支持http https 默认带证书
	自动帮你创建https证书

现在

- 小的使用优化(思考了再动手) 都是错误如何展示的 2小时把
	- 如果remote的服务器挂掉
	- 如果json写的不规范呢，跟json文件不存在区分开来[]
	- combo时的output展示[]
	- 是错误就throw error 一定要明确<q></q>去[]
	- 如何不打sudo时，就会强制提醒一定要打sudo呢[]
	- 文件找不到等错误，在web页面中也应该体现出来吧[]
- 内部的重构，是否使用request来替代过去的http|https
- 证书问题(花点时间)
	- combo时，会出现证书找不到的问题，是因为当前这个请求没有给它正确的返回cert吗？[] **
	- dns的问题 如果本地hosts里写的有dns
- 文档自己再重头到尾看下
- 将来版本号以及功能开发的一些规范
- hoxy http://greim.github.io/hoxy/
- nproxy https://github.com/goddyZhao/nproxy http://www.siyuweb.com/tool/2631.html
- livepool http://www.alloyteam.com/2014/07/nodejs-debug-proxy-livepool/

将来的规划

- dip这样的支持作为插件功能(需要思考了 不急)
- combo这样的也开放为插件？(需要思考的 不急)
- pac代理(1小时调研下)
- 移动端支持(1小时调研)
- webpack工程化(1小时调研)
- 校验
	- 后端接口校验
	- 前端请求校验

- 优化mockx的内部逻辑

优化

- 还缺少哪些功能呢？模拟404还有什么呢？

- 是否有一个根据当前的url，可以选择添加一条规则，很方便，类似goagentx
- 移动端如何代理呢？
- 测试 diff功能？(先下放)
- web日志

这两周完成

# 第二阶段 平台化


# 文档

工具是什么？定位是什么样的？独立的nodejs的http代理工具

use cases

table of contents

是什么？一般什么场景想
核心概念 即如何应用的？理念，使用方法的讲解，解惑。让别人的大致有个认知吧 适不适用于当前的环境 
https://github.com/nodejitsu/node-http-proxy#options
(一般我们前端做本地开发，后端接口可能还未准备好，接口可能是`/api/message/list`但是后端接口又没做好，使用mockx，我们通过估计配置把接口`/api/message/list`映射到一个本地文件，而不是修改源代码中ajax请求的url地址) 最好能再带一个原理图呢。

最后要配上一个项目的目录结构
一个完整的url分解 route是哪部分 data host
table of contents
example
use cases 每个都写上一段和注释
	webpack开发的接口mock
		- 可以将/api/* 发送到80端口
		- 也可以用mockx来承接，将未配置的url再代理到9112端口
	替换线上某个html来排查bug(同时可以mock js, css等资源)
	同时代理一批接口，正则
	接口数据的随机mock(底层mockjs)
	根据query返回不同内容
	指定发送的headers或者返回的headers
	jsonp
	delay
	dipApp
	dipSchema

Options 有 Note
	domains
	mockDir
	rules

Options.rules 有 Note
	匹配

	Note: 可以多个组合匹配

	响应

	Note: 只能有一个响应

TODO

说明匹配的顺序和规则
Features

## 如何写好技术文档

- https://www.zybuluo.com/xishuixixia/note/174299
- https://github.com/ruanyf/document-style-guide
- http://yunli.blog.51cto.com/831344/168352
- https://www.zhihu.com/question/19945828

# PAC

- 我想代理某个域名下所有的内容
- 我想代理某个域名下的部分内容，正则的
- 移动端怎么整合？
- 想想之前的goagentx的配置
- node能否调用mac的网络设置，然后填入自动代理配置呢
- 添加删除时，是否好管理呢？

https://github.com/bannedbook/fanqiang/wiki/pacfq

坏处&局限

可能跟本地翻墙工具冲突

好处

不占用80端口
不用flex-hosts不能发现已经在hosts中的配置


# 插件

```

```


# 参考

sosoapi 接口
RAP https://github.com/thx/RAP
faker https://github.com/marak/Faker.js/
mtop呢？

# 项目计划

我跟市面上的proxy的区别，有什么优势

命令行 server 可接受的
web-admin 第一的 
服务端 很重要的 可以做到共享了
客户端 稍后的

## web-admin(易上手操作，同时给服务端铺路) 2.9全部搞定

config(概览) 暂时不做？
	domains, mockDir rules的管理(编辑 删除 禁用)
api编辑页(能简单的上手，了解工具特征 可能给非程序员使用) json编辑器 js编辑器
	
project列表
project详情 
api添加

## 服务端(能共享) 2.15前搞定


## 


还剩14天了
我来做底层的功能 早上吧
	compare功能 done了
	和server配置的同步
	代码优化  能否做到对`plug-base`无感知，引入`plug-base-wrap`，对plug-base的方法也做到隐蔽，都是直接调用Mockx的方法
	<!-- new MockX(config) {} -->
	可靠性 简单性 dip网络挂掉的时候，整个程序应该不会有问题
	<!-- 如何做到完全不用重启的 -->
	-[x] mockx.js 放到哪里，mock文件夹放到哪里，都可以简单运行起来
	json还有jsonp的头是否要修正下，contentType这个头
	-[] 写使用的文档
	-[] 优化的
		warning提示 应该有不同的颜色
	-[] 输入正确性校验
		用户的route是否以'/'反斜杠开头，否则是不能匹配的
	-[] 输入性校验
		如用户的输入
		参数的输入校验
	-[] pac的可行性，charles使用的是什么？

线上平台 
	web前台 
		/project/list 项目列表页
		/project/detail 项目详情页
		/project/create 项目详情页
		/api/ api编辑页
	接口
		项目列表 /project/list
		项目创建 /project/create
		项目详情 /project/detail
```
{
	name: ,
	description: ,
	apiIds: []
}
```
		api编辑  /api/save
```
{
		
}
```
	数据后台
		数据helper project和api的存储
	mock服务
		把mockjs给搬上去就可以了，作为一个处理中间件
	其它
		是否提供compare服务
		数据请求记录
	schemas
	服务
		是否支持mock数据修改的记录和比对，这样就支持后端的接口做了什么修改
	api编辑页
		保存时输出一段json是关于这个接口的

	
	- project，api底层的存储 midway
	- project list页面
	- project页面 api-list
	- api的编辑页面   
		<!-- 请求的匹配 都是几个input框 -->
		route
		data
		host
		<!-- 返回的内容 需要一个编辑器 -->		
		file 将内容填进去即可
		json 支持mockjs
		jsData
		remote
		dipSchema
		dipApp
		<!-- helper功能 -->
		charset
		responseTime
		headers
		404, 301等
		弱网环境
		接口纯挂掉？
		jsonp
	- 处理来自客户端的数据请求 mockx.com/mock?id=123
	- 关于请求的记录呢
	- 关于compare呢 
		- 通过切面，afterRequest然后做比对。再重新发送一个Bullet，同时我们可以看下我们的Bullet是否是独立的。

# 问题

- 为什么别人装上的时候，.bin不生效呢？
- 再需要进入.config目录不合适哇 
- **提供一个客户端的？很方便的使用，即下即用 web页面的形式编辑**
- 这个web编辑页面同时也是将来自己的平台也需要的
- JSON.stringify的时候，正则有问题

# 计划&优先级

- fakerjs 查看，我们是否需要开放API
- 有时候不是个项目，比如我就想突然替换线上某个url的内容为我本地的html，如何能超级快速的写进去，然后匹配替换，就想ihosts使用那样简单。是否是来个yo呢，或者把这个东西的启动搞得轻量级一些，封装起来
- 好的错误提示，没有填写`mockx.js`这个文件呢
- 不用重启这个很重要
- README，可以别人查看，也可以推广出去
- 提供给外部的mock的能力，mockjs，jsData的能力
- api的编辑页面，把API给web化操作
- 是否用pac模式，不修改别人的hosts
- 最简化这个项目
- 待加入的
	是否支持加入某种类型，如前台的商品
- 快速使用
	比如anywhere 一行代码就可以了。
	能否一行命令就创建一个环境，方便的写上规则和映射的文件。其实就是映射某个url到本地。

项目这样的化能否推广出去，和dip的结合重要吗？

# mockx-cli

- 简化命令为 `mockx init` `mockx serve`
- 挑选合适的

## 最简化使用

- 是使用yo快速的创建一个文件夹结构呢？如何创建一个文件夹结构
	- 使用git clone下来gitlab上的一个仓库，但是
- 还是使用简单的界面化的工具实现呢呢？

# 卖点

完全无侵入的
上线不需要做任何修改
动态数据，mockjs 或是 js逻辑 甚至是一个html
可修改header，模拟404，301等特殊情况，可以修改cookie
模拟特殊场景，相应延时, jsonp
支持https, http

# 数据结构 

```
project
{
	id: 1,
	name: '项目的名字',
	description: '项目的描述',
	apis: [1,2,3]
}

api
{
	id: 1-1,
	<!-- 还能回到project中去 -->
	parent: 1,
	name: '用户信息接口',
	description: '用户信息的介绍',
	config: {
		route: ,
		host: ,
		jsData: ,
		json: 
	}
}

```


# 服务端mock功能

- /mock?id=1133 拿到了 req, 还有服务端的配置
- 服务端如果有img等文件的匹配怎么办，暂时只需要html和json, 还有jsData ()
- file json jsData 这三种类型
- mockx 如何在服务端跑起来 只需要调用bullet就可以了
- bullet req, res(需要吗), string, callback 提供一个简单的工具版本吧 只关心 this.req, string, callback就可以了 

# 哪几大项

- 后端源接口测试 compare对比 在哪里展示呢
- 数据mock(多种mock方式 json jsData file mockjs 甚至根据schema来mock)
- 异常功能(弱网 404 301等)
- dip 接口定义结合

# 需要做哪些操作

- web网站 接口的管理 list 以什么维度来管理呢？
- 接口的定义和修改 mock
- 接口mock编辑器 
- 后端接口测试 存储 以及web展示界面
- mockx的底层，能完成数据mock，异常功能

# thinking 

- 本地的server如何和服务端进行结合
- 本地和server如何配合，处理是线上处理还是本地处理
	有时候想本地也处理些proxy的需求
	服务端只是做为中心，客户端会请求sync到本地呢？
- 这套系统做好后，能否脱离独立出去呢？做好最大的独立性的需求，到下一个公司
- 从一个移动端的需求出发，能否满足需求呢？移动端是绑定到本机，还是直接IP指向到server呢
- localhost/update 可以更新下接口的配置出来
- 优先级，本地的大于从mock平台取出来的，可以用先后顺序来解决
- 定位
	本地server 做proxy 转发
	线上平台 做接口管理 数据的mock 

## 功能compare

- 数组的不一致就比比较了把，这个有点

# TODO

新功能

- compare对比功能
	保存一份差异的文件，然后页面化可以展示差异
- 线上化
	校验后端的接口正确性
	后端也可以修改这份mock数据
	同步mock到本地? 还是在线上同步呗
	和DIP的打通，
	弱网环境 
- 需要考虑能在家里离线使用
- confDir 以及 base路径等，需要重新再理一下
- 容错 比如mockx.js配置文件的出错

加了更好的：

- 如何处理404，301，以及responseText 如何方便的插入 给这些提供一些方法的能力

优化：

- 需要传递的charset，header参数，能否通过别的方式来做
- route匹配上是否更方便呢？
- 减少参数 如修改headers，可以用 this.setHeader  header存储到this对象中
- compileDip 只执行一次 或者检测到mockx.js文件有变化，就再次去compileDip一次

## 如何最简化这个项目呢

-

## 需要做的

<!-- 有callback字段，自动识别为jsonp请求，不需要用户填写 -->
- **一个page，通过填写form生成相应的规则，减小使用的成本**
- **再修复下js部分的 使用js的例子**
- **将20%常用的场景的demo展示清楚，解决大部分问题**
- **白名单mtop自动转发到线上**
- 在response的header中带一些mockx的调试信息，x-
- resonse中添加 mime-types 字段 json, jsonp等
- 能否在mockx项目下跑一个test

helper部分

更多的模拟，需要的特殊场景，如404，301等

### helper

sucess的场景
```
{
	"success": true
}
```

### 

## 设计规划 下一步

**与charles的区别，我的目标是什么呢？下一步**

- 接口中心 接口服务器	

	- 对比swagger https://www.zhihu.com/question/35436669
	- api-document https://github.com/yalishizhude/api-document
	- 美团vaue 

- json5的支持
	 - http://json5.org/ json没那么严格，json中也可以有注释

- 独立为客户端 (为了快速的映射，不要再启动开发环境什么的)

- 功能补充
	- helper 错误 404, 301 查看jquery常见的error有哪些，然后以此找要做哪些
	- response 可以修改header头
	- dealy 范围值，而不是定值

- compare功能
	- 开启compare则对比，如果比对有不同则提示，同时对线上的数据download本地
	- 接口有个参数viewCompare则会展示一个compare比较结果的页面

是否可能有问题

- 开启debug模式时，将转发remote请求的headers和rawBody都write到一个文件中，方便排查。

# 将来

mockx 测试用例，更方便的本地测试，每次改版保证mockx不能挂掉。

mockx 客户端，专门做数据的mock功能

# 畅想一下我们的场景

- 开发阶段 
	我们自己写的mock配置以及响应的文件(这个文件也可以后端来写 可以由后端去写这份配置)

- 联调测试阶段
	修改env为test, 则会对线上返回的数据和服务端的数据做比对，同时报出不同点(最好保存有数据，可以可视化查看两者的差异，只要保存两份数据的备份，即可查看差异了，去除数值的不同) 分离 查看差异的可以通过另一份工具
	测试同学有什么需求吗？

- 中间有过修改的自动同步
	

- 上线阶段
	
# 本周的工作

- 微淘的账号
- 魔盒 图片上传
- 拖带的功能
- 量饭团规格
