// var request = require('sync-request');

// var res = request('GET', '', {
//   timeout: 3000
// });

// var rules = [1,2,3]

// var toaddRules = JSON.parse(res.getBody().toString());

// console.log(rules.concat(toaddRules));


var url = require('url');

var urlObj = url.parse('http://localhost:6001/api/client/rules?project_id=4&id=2', true);

console.log(urlObj);

var newUrl = url.format({
	pathname: urlObj.pathname,
	query: {name: 'han'}
})

console.log(newUrl);