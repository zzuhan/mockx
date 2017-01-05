


console.log('/api/100000/opera'.match(/\/api\/(\d{5,10})\/(.+)/i));


var MockBullet = require('../lib/bullet');


function testReg(){
	var rule = {
		"route": /\/api\/(.+)\/(.+)/i,
		"json": "$1_$2.json"
	}

	var req = {
		url: '/api/opera/a',
		connection: {
			encrypted: false
		},
		headers: {
			host: 'localhost'
		}
	};
	var res = {};

	var param = {
		mockDir: './mock',
		hosts: {}
	}

	function callback(err, data){
		console.log(data);
	}

	new MockBullet(req, res, rule, param, callback);

}

function testFile(){
	var rule = {
		"route": /\/api\/(.+)\/(.+)/i,
		"json": "$1_$2.json"
	}

	var req = {
		url: '/api/opera/a',
		connection: {
			encrypted: false
		},
		headers: {
			host: 'localhost'
		}
	};
	var res = {};

	var param = {
		mockDir: './mock',
		hosts: {}
	}

	function callback(err, data){
		console.log(data);
	}

	new MockBullet(req, res, rule, param, callback);

}

function testJsData(){
	var rule = {
		"route": /\/api\/(.+)\/(.+)/i,
		"json": "$1_$2.json"
	}

	var req = {
		url: '/api/opera/a',
		connection: {
			encrypted: false
		},
		headers: {
			host: 'localhost'
		}
	};
	var res = {};

	var param = {
		mockDir: './mock',
		hosts: {}
	}

	function callback(err, data){
		console.log(data);
	}

	new MockBullet(req, res, rule, param, callback);

}

function testRemote(){
	var rule = {
		"route": /\/api\/(.+)\/(.+)/i,
		"json": "$1_$2.json"
	}

	var req = {
		url: '/api/opera/a',
		connection: {
			encrypted: false
		},
		headers: {
			host: 'localhost'
		}
	};
	var res = {};

	var param = {
		mockDir: './mock',
		hosts: {}
	}

	function callback(err, data){
		console.log(data);
	}

	new MockBullet(req, res, rule, param, callback);

}

testReg();



