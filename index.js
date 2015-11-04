var Mock = require('./lib/manager');
var compile = require('./lib/compile');

/**
 * 中间件模式API
 */
function middleware(params, dir) {
  // 其实Mock也只是个单例
  var mock = new Mock(params, dir);

  return function (req, res, next) {
    if (res._header) {
      next();
    }
    else {
      mock.handle(req, res, next);
    }
  }
}

/**
 * 模板编译模式API
 */
function compile(tpl, data) {
  return compile(tpl, data);
}

var exports = module.exports = middleware;
exports.mock = compile;
