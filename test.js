// 还必须保持好顺序 1 2 3 

var url = "http://c-assets.tmall.net/ju/seal/0.1.1/??vendor.js,pages/sellerIndex/index.js";
var urlLib = require('url');
var pathLib = require('path')

var urlObj = urlLib.parse(url);

console.log(urlObj);

var query = urlObj.query;
query = query.replace('?', '');
var files = query.split(',');
var filesPath = [];
files.forEach(function(file) {
  var filePath = urlLib.format({
    protocol: urlObj.protocol,
    host: urlObj.host,
    pathname: pathLib.join(urlObj.pathname, file)
  })
  filesPath.push(filePath);
})

var request = require('request');
var async = require('async');

var funcs = [];

// async.par.push()

funcs.push(function(callback) {
  request(filesPath[0], function(error, response, body) {
    if(!error) {
      callback(null, body);
    } else {
      callback(error);
    }
  });
})
funcs.push(function(callback) {
  request(filesPath[1], function(error, response, body) {
    if(!error) {
      callback(null, body);
    } else {
      callback(error)
    }
  });
})

async.parallel(funcs, function(err, results) {
  console.log('something');
  console.log(results.join(''));  
})