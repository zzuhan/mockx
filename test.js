var isUtf8 = require('is-utf8');
var fs = require('fs');

var content  = fs.readFileSync('/Users/hanwencheng/devspace/zs-freeway/compare/cnodejs.org/api.v1.topic.57ea257b3670ca3f44c5beb6/remote.json');
console.log(isUtf8(content))



