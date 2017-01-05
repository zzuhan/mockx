# 参考

sosoapi 接口
RAP https://github.com/thx/RAP
faker https://github.com/marak/Faker.js/
mtop呢？

# 项目计划

还剩18天了
我来做底层的功能 compare功能 弱网环境 和server配置的同步
线上平台 
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
		- 


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
	
