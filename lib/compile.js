var debug = require('debug')('mockx:compile')

/**
 * 将数据模板编译出真正的数据
 * @param  {object} tpl
 * @param  {[object]} data 要配合动态渲染的数据
 * @return {object}      js对象
 */
function compileTpl(tpl, data) {

  data = data || {};

  	// 先mockjs
	tpl = handleByMockjs(tpl);
	tpl = JSON.parse(require('juicer')(JSON.stringify(tpl), data));

  // 返回的是json的数据
  return tpl;
}

function handleByMockjs(tpl) {
  delete require.cache[require.resolve('mockjs')];

  tpl = require('mockjs').mock(tpl);

  return tpl;
}

module.exports = compileTpl;
