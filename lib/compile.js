function compileTpl(tpl, data){
	data = data || {};

	tpl = handleByMockjs(tpl);
	// juicer解析
	return require('juicer')(tpl, data);
}

function handleByMockjs(tpl) {
	tpl = require('mockjs').mock(JSON.parse(tpl));

	return JSON.stringify(tpl); 
}


module.exports = compileTpl;
