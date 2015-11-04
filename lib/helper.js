var request = require('sync-request');
var urlLib = require('url');
var pathLib = require('path');

// Helpers
// =========
function isRegExp(obj) {
  return Object.prototype.toString.call(obj) === "[object RegExp]";
}
exports.isRegExp = isRegExp;

function checkMatch(regOrString, target) {
  if (isRegExp(regOrString)) {
    return regOrString.test(target);
  } else {
    return regOrString === target;
  }
}
exports.checkMatch = checkMatch;

function ifQueryMatch(dataConfig, reqData) {
  for (var key in dataConfig) {
    if (!checkMatch(dataConfig[key], reqData[key])) {
      return false;
    }
  }
  return true;
}
exports.ifQueryMatch = ifQueryMatch;

/**
 * 如果不传host，则是匹配所有host
 */
function ifHostMatch(hostConfig, reqHost) {
  if (!hostConfig) return true;
  return checkMatch(hostConfig, reqHost);
}
exports.ifHostMatch = ifHostMatch;

// 清除最后一个反斜杠，
function removeLastBackslash(str) {
  if(typeof str === 'string' && str[str.length-1] === '/') {
    return str.slice(0, -1);
  }
  return str;
}
exports.removeLastBackslash = removeLastBackslash;

var getConfigBySchemaId = (function () {
  var schemaConfigCache = {};
  return function (schemaId) {
    var schema,
    thisConfig = {};

    if (!schemaConfigCache[schemaId]) {
      try {
        var res = request('GET', 'http://dip.alibaba-inc.com/api/v2/schemas/' + schemaId + '/content', {
          timeout: 3000
        });
      } catch(e) {
        console.log('dip根据schemaId获取schema信息失败，请确认dip是否通畅');
        return thisConfig;
      }

      schema = JSON.parse(res.getBody().toString());
     
      // dip http 并且需要填写 `真实接口地址` 的url
      if (schema.meta && schema.meta.uri) {
        var uriMeta = urlLib.parse(schema.meta.uri, true);

        // 支持手动覆盖
        thisConfig.route = uriMeta.path;
        thisConfig.host = uriMeta.host;
        thisConfig.remote = 'http://dip.alibaba-inc.com/api/v2/services/schema/mock/' + schemaId;
      }
      // dip mtop
      // /h5/mtop.taobao.freeway.sellerreport.getSignRecordList/1.0/
      if (schema.meta && schema.meta.mtop_name) {
        var mtopPath = pathLib.join('/h5', schema.meta.mtop_name, schema.meta.mtop_version)

        thisConfig.route = mtopPath;
        thisConfig.remote =  'http://dip.alibaba-inc.com/api/v2/services/schema/mock/' + schemaId;
      }

      schemaConfigCache[schemaId] = thisConfig;
    } else {
      thisConfig = schemaConfigCache[schemaId];
    }

    return thisConfig;
  }
})();

exports.getConfigBySchemaId = getConfigBySchemaId;

var getSchemasByAppId = (function(){
  // dip缓存，即只请求一次，
  var appConfigsCache = {};
  return function (appId) {
    var addConfigs = [],
      schemas;

    if (!appConfigsCache[appId]) {
      try {
        var res = request('GET', 'http://dip.alibaba-inc.com/api/v2/apps/' + appId + '/schemas', {
          timeout: 3000
        });
      } catch(e) {
        console.log('dip根据AppId获取schemas失败，请确认dip是否通畅');
        return addConfigs;
      }
      schemas = JSON.parse(res.getBody().toString());

      schemas.forEach(function (schema) {
        addConfigs.push({dipSchema: schema.id});
      });

      appConfigsCache[appId] = addConfigs;
      
    } else {
      addConfigs = appConfigsCache[appId];
    }

    

    return addConfigs;
  }
})();

exports.getSchemasByAppId = getSchemasByAppId;
