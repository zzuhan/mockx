/**
 * TODO 这里面callback太乱了，不太容易看懂，cb，callback换个更有意义的名字
 */

module.exports = MockBullet;

var fs = require('fs');
var pathLib = require('path');
var urlLib = require('url');
var async = require('async');
var merge = require('merge');
var iconv = require('iconv-lite');
var isUtf8 = require('is-utf8');

/**
 * 子弹 一个匹配
 * @param {Object}   config 
 * @param {Object}   req    original request
 * @param {Function} cb     流程中callback，即处理函数
 * @param {[type]}   param  [description]
 */
function MockBullet(req, config, param, cb) {
  var _this = this;

  this.req = req;
  this.hosts = param.hosts || {};
  this.base = pathLib.dirname(param.rootdir) || process.cwd();

  var matched = null;
  if (typeof config.route != "string") {
    matched = req.url.match(config.route);
  }

  // 简单点，先全都放入？然后里面再判断？
  var queue = [
    function (callback) {
      _this.jsonHandler(config.json, matched, callback);
    },

    function (callback) {
      _this.jsDataHandler(config.jsData, matched, callback);
    },

    function (callback) {
      _this.remoteHandler(config.remote, matched, callback);
    }
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
      var callbackFuncName = req.query[config.jsonp];
      ret.data = callbackFuncName + '(' + JSON.stringify(ret.data) + ')';
    } else {
      ret.data = JSON.stringify(ret.data);
    }

    // TODO responseTime添加到此，是否合适
    setTimeout(function () {
      cb(null, ret.data, ret.path);
    }, config.responseTime || 0);
  });
}

// jsonHandler jsDataHandler remoteHandler
['json', 'jsData', 'remote'].forEach(function (type) {
  MockBullet.prototype[type + 'Handler'] = function (target, matched, callback) {
    // 如果不存在，返回null就行了
    if (!target || target.indexOf('#') == 0) {
      callback(null, null);
    }
    else {
      if (matched) {
        target = target.replace(/\$(\d{1,})/g, function (t, num) {
          return matched[num] ? matched[num] : t;
        });
      }
      this.handlers[type].bind(this)(this.req, target, callback);
    }
  }
});

// OPTI 这个实现有点ugly
MockBullet.prototype.handlers = {

  json: function (req, filepath, callback) {
    var fullpath = pathLib.join(this.base, filepath);

    try {
      var dataTpl = fs.readFileSync(fullpath).toString();
      // 模板系统
      var data = require('./compile')(JSON.parse(dataTpl), req);

      callback(null, {data:data, path:fullpath});

    } catch (e) {
      callback(fullpath + ' not exists, or not a valid json');
    }
  },

  jsData: function (req, filepath, callback) {
    var fullpath = pathLib.resolve(pathLib.join(this.base, filepath));
    delete require.cache[fullpath];
    // 需要传入一个req
    callback(null, {data:require(fullpath)(req), path:fullpath});
  },

  // 1 我认为存在两种，一种是完全是一致的
  // 2 另一种是完全不一致，另一个remote
  // 先只支持带上get的参数，
  remote: function (req, target, callback) {
    var hosts = this.hosts;
    var fetch = require('fetch-agent');

    // 2 请求另一个remote地址
    // 如果需要cookie等，则让其写一个headers的option
    // TODO 需要的话，可以为其带query和body
    if (target !== 'self') {

      var targetMeta = urlLib.parse(target);

      var finalUrl = urlLib.format({
        protocol: targetMeta.protocol,
        query: req.query,
        host: targetMeta.host,
        port: targetMeta.port,
        pathname: targetMeta.path
      });

      fetch.request(finalUrl, hosts, function (err, buff) {
        if (!err) {
          callback(null, {
            data:JSON.parse(iconv.decode(buff, isUtf8(buff) ? 'utf-8' : 'gbk')),
            path: finalUrl
          });
        } else {
          callback(err);
        }
      });

      // 完全一致的转发，复制一个当前的req
    } else {

    }
  }
};