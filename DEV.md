
# TODO

confDir 以及 base路径等，需要重新再理一下
容错 比如mockx.js配置文件的出错
如何处理404，301，以及responseText 如何方便的插入 给这些提供一些方法的能力
compileDip 只执行一次 或者检测到mockx.js文件有变化，就再次去compileDip一次
减少参数 如修改headers，可以用 this.setHeader  header存储到this对象中
需要传递的charset参数，能否通过别的方式来做

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

是否可能有问题

- 开启debug模式时，将转发remote请求的headers和rawBody都write到一个文件中，方便排查。


# 将来

mockx 测试用例，更方便的本地测试，每次改版保证mockx不能挂掉。

mockx 客户端，专门做数据的mock功能