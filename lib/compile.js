/**
 * 将数据模板编译出真正的数据
 * @param  {object} tpl  
 * @param  {[object]} data 要配合动态渲染的数据
 * @return {object}      js对象
 */
function compileTpl(tpl, data){
	data = data || {};

	tpl = handleByMockjs(tpl);

	// juicer解析
	return JSON.parse(require('juicer')(JSON.stringify(tpl), data));
}

function handleByMockjs(tpl) {
	tpl = require('mockjs').mock(tpl);

	return tpl;
}


module.exports = compileTpl;
