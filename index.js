var Mock = require('./lib/manager');
var compile = require('./lib/compile');

/**
 * 中间件模式API
 */
function buildMiddleware(confFile, hosts){
  return function middleware(params, dir) {
    // 其实Mock也只是个单例
    var mock = new Mock(params, dir, confFile, hosts);

    return function (req, res, next) {
      try {
        if (res._header) {
          next();
        }
        else {
          mock.handle(req, res, next);
        }
      } catch(e) {
        console.log(e);
        console.log(e.stack);
      }
    }
  } 
}



/**
 * 模板编译模式API
 */
function compile(tpl, data) {
  return compile(tpl, data);
}

var exports = module.exports = buildMiddleware;
exports.mock = compile;
