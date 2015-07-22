/**
 * TODO 这里面callback太乱了，不太容易看懂，cb，callback换个更有意义的名字
 */


module.exports = MockBullet;

var fs = require('fs');
var pathLib = require('path');
var async = require('async');
var merge = require('merge');
var iconv = require('iconv-lite');
var isUtf8 = require('is-utf8');

/**
 * 子弹 一个匹配
 * @param {Object}   config 
 * @param {Object}   req    original request
 * @param {Function} cb     流程中callback，即处理函数
 * @param {[type]}   hosts  [description]
 */
function MockBullet(config, req, cb, hosts) {
  var _this = this;

  this.req = req;
  this.hosts = hosts;

  // 简单点，先全都放入？然后里面再判断？
  var queue = [
    (function (file) {
      return function (callback) {
        _this.jsonHandler(file, callback);
      }
    })(config.json),

    (function (file) {
      return function (callback) {
        _this.jsDataHandler(file, callback);
      }
    })(config.jsData),

    (function (file) {
      return function (callback) {
        _this.remoteHandler(file, callback);
      }
    })(config.remote)
  ];

  // parallel
  async.parallel(queue, function (err, results) {
    if (err) cb(err);

    // 数据处理

    var jsonRet = results[0] || null,
      jsDataRet = results[1] || null,
      remoteRet = results[2] || null;

    // 优先级
    var ret = merge(remoteRet, jsonRet, jsDataRet);

    if (config.jsonp) {
      var callbackFuncName = req.query[config.jsonp]
      ret = callbackFuncName + '(' + JSON.stringify(ret) + ')';
    }

    // TODO responseTime添加到此，是否合适
    setTimeout(function () {
      cb(null, ret);
    }, config.responseTime || 0);
  });
}

// jsonHandler jsDataHandler remoteHandler
['json', 'jsData', 'remote'].forEach(function (type) {
  MockBullet.prototype[type + 'Handler'] = function (target, callback) {
    // 如果不存在，返回null就行了
    if (!target || target.indexOf('#') == 0) {
      callback(null, null);
    } else {
      this.handlers[type](target, callback, this.req, this.hosts);
    }
  }
});

// OPTI 这个实现有点ugly
MockBullet.prototype.handlers = {

  'json': function (filepath, callback, req) {
    try {
      var fullpath = pathLib.join(process.cwd(), filepath);

      var dataTpl = fs.readFileSync(fullpath).toString();

      // 模板系统
      var data = require('./compile')(JSON.parse(dataTpl), req);

      callback(null, data);

    } catch (e) {
      callback(fullpath + ' not exists, or not a valid json');
    }
  },

  'jsData': function (filepath, callback, req) {
    var fullpath = pathLib.resolve(pathLib.join(process.cwd(), filepath));
    delete require.cache[fullpath];
    // 需要传入一个req
    return callback(null, require(fullpath)(req));
  },

  // 1 我认为存在两种，一种是完全是一致的
  // 2 另一种是完全不一致，另一个remote
  'remote': function (target, callback, req, hosts) {
    var fetch = require('fetch-agent');

    // 2 请求另一个remote地址
    // 如果需要cookie等，则让其写一个headers的option
    // TODO 需要的话，可以为其带query和body
    if (target !== 'self') {

      fetch.request(target, hosts, function (err, buff, nsres) {
        if (!err) {
          callback(null, JSON.parse(iconv.decode(buff, isUtf8(buff) ? 'utf-8' : 'gbk')));
        } else {
          callback(err);
        }
      });

      // 完全一致的转发，复制一个当前的req
    } else {

    }
  }
};