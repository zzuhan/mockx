
# TODO

今天 

- 如果file，自动读取，然后配上fileType
- remote，请求自身的value, 改为'original'
- mtop这种有特征的，可以直接为其添加其它url映射到'original'。或者作为mockx的default配置，公司这些接口域名，直接映射到'original'
- meta charset的问题 为何gbk不行
- 良田的那个需求是什么?
- 能否在映射中写判断语句
- 案例，篡改headers中的cookie

是否可能有问题

- 如果两条规则，一条有data匹配，一条没data匹配，会中那一条

- 在家的时候，mockx的DIP会有问题，会一直请求
- 开启debug模式时，将转发remote请求的headers和rawBody都write到一个文件中，方便排查。

# 将来

mockx 测试用例，更方便的本地测试，每次改版保证mockx不能挂掉。

mockx 客户端，专门做数据的mock功能