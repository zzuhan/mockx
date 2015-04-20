var Mock = require('mockjs');
var data = Mock.mock({
    'data|1-10': [{
        'id|+1': 1
    }]
});
console.log(JSON.stringify(data, null, 4));

console.log( Mock.mock('@image(120x240)') );

