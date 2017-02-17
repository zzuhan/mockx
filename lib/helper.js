var request = require('sync-request');
var urlLib = require('url');
var pathLib = require('path');
var mime = require('mime');

var debug = require('debug')('mockx:manager')

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
    if(typeof dataConfig[key] == 'number') throw new Error('config.data中配置的value必须都是字符串或正则，数字在这里被解析为字符串');
    if (!checkMatch(dataConfig[key], reqData[key])) {
      return false;
    }
  }
  return true;
}
exports.ifQueryMatch = ifQueryMatch;

function parseJSONorJSONP(str, callback, jsonpName) {
  // console.log('start parse');
  try {
    var jsonData = JSON.parse(str)
    callback(jsonData);

    // 假设是jsonp，进行解析
  } catch (e) {
    // console.log('parse jsonp');
    // console.log('jsonp str is', str);
    // bug 因为str为空，所以导致后面callback没有被执行
    var f = new Function(jsonpName, str);
    f(callback);
  }
}
exports.parseJSONorJSONP = parseJSONorJSONP;

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

function getFileMime(file){
  return mime.lookup(file);
}
exports.getFileMime = getFileMime;


/**
 * data接口 http://dip.alibaba-inc.com/api/v2/schemas/12190/content
 * http接口 http://dip.alibaba-inc.com/pages/schemas/12191
 * mtop接口 
 */
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
        console.log('[Mockx Warning] dip根据schemaId获取schema信息失败，请确认dip是否通畅');
        return thisConfig;
      }

      schema = JSON.parse(res.getBody().toString());

      var schemaMeta = schema.meta;

      // 有meta的，即mtop和http
      if(schemaMeta) {

        // http并且写了uri字段
        if(typeof schemaMeta.uri == 'string' && schemaMeta.uri) {
          var uriMeta = urlLib.parse(schemaMeta.uri, true);

          // 支持手动覆盖
          thisConfig.route = uriMeta.path;
          thisConfig.host = uriMeta.host;
          thisConfig.remote = 'http://dip.alibaba-inc.com/api/v2/services/schema/mock/' + schemaId;

        // mtop 
        // url格式是这样的 /h5/mtop.taobao.freeway.sellerreport.getSignRecordList/1.0/
        } else if(schemaMeta.mtop_name) {
          var mtopPath = pathLib.join('/h5', schema.meta.mtop_name, schema.meta.mtop_version)

          thisConfig.route = mtopPath;
          thisConfig.remote =  'http://dip.alibaba-inc.com/api/v2/services/schema/mock/' + schemaId;

        // http忘了写url字段或者uri字段是对象
        } else if(typeof schemaMeta.uri == 'object') {
          console.log('[Mockx Warning] Dip Schema ' + schemaId + '的接口配置是多地址，Mockx只支持唯一地址');
        } else {
          console.log('[Mockx Warning] Dip Schema ' + schemaId + '的配置缺少uri字段，请在scheme编辑->meta中设置接口地址');
        }
      }

      // 其它情况可能是data(没有meta字段)，也可能meta填写的不全

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
  return function getSchemasByAppId(appId) {
    var configs = [],
      schemas;

    if (!appConfigsCache[appId]) {
      try {
        var res = request('GET', 'http://dip.alibaba-inc.com/api/v2/apps/' + appId + '/schemas', {
          timeout: 3000
        });
      } catch(e) {
        console.log('[Mockx Warning] dip根据AppId获取schemas失败，请确认dip是否通畅');
        return configs;
      }
      schemas = JSON.parse(res.getBody().toString());

      schemas.forEach(function (schema) {
        configs.push({dipSchema: schema.id});
      });

      appConfigsCache[appId] = configs;
      
    } else {
      configs = appConfigsCache[appId];
    }

    return configs;
  }
})();

function getRulesByProjectId(projectId){
  var rules = [];

  if(!projectId) return rules;

  try {
    var res = request('GET', 'http://localhost:6001/api/client/rules?project_id=' + projectId, {
      timeout: 3000
    });

  } catch(e) {
    console.log('[Mockx Warning] dip根据AppId获取schemas失败，请确认dip是否通畅');
    return rules;
  }

  rules = JSON.parse(res.getBody().toString());

  return rules;
}

exports.getRulesByProjectId = getRulesByProjectId;
exports.getSchemasByAppId = getSchemasByAppId;
