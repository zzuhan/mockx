var urlLib  = require('url');
var http = require('http');
var merge = require('merge');

var options = { 
	host: 'localhost',
  port: '9112',
  path: '//build/pages/plan-create/index.js',
  method: 'GET',
  headers: 
   { connection: 'keep-alive',
     'cache-control': 'max-age=0',
     'upgrade-insecure-requests': '1',
     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
     'accept-encoding': 'gzip, deflate, sdch, br',
     'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
     cookie: 'cna=u9caEcoMqCUCASp4SmTSo5h4; CNZZDATA30049117=cnzz_eid%3D326166429-1486532988-%26ntime%3D1486532988; _ga=GA1.1.859537708.1486880917; l=Ag8PVq6BLCgijBeW-L9DiBilH6kZoWNL; isg=AllZdCCHZW7KDznFnAP3moYzaEMQTk2Y97aY33sOQADignsUxzQMaCSa8vEO; CNZZDATA1257845828=1932797489-1487638514-%7C1487638514' } }

http.request(options, function(proxyRes) {
	console.log('something');
})