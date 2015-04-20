var juicer = require('juicer');

var data = {
   name: 'han'
};

var tpl = "${name}";

// 默认就支持编译
var html = juicer(tpl, data);

console.log(html);