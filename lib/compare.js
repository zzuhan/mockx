// 简析一下这个工具

// 初始化meta一个结构化的数据
// 之后再解析，并且充实这套json内容
// {
// 	// 格式化后，在页面中输出的内容
// 	out: '',
// 	// 每行的时候，会有加有减的
// 	indent: -1,
// 	// 即key的路径，如 ['/', 'result', 'name']
// 	currentPath: [],
// 	// 解析所有字段，生成一套paths
// 	paths: [],
// 	line: 1
// }

// // 两个值不一样的结果 
// [
//   {
//     "path1": {
//       "path": "/name",
//       "line": 2
//     },
//     "path2": {
//       "path": "/name",
//       "line": 2
//     },
//     "type": "eq",
//     "msg": "Both sides should be equal strings"
//   }
// ]


// path结构化的数据，即path和line，path用来标记，line用来标记在页面中的位置
// pathObj
// {
// 	"line": '2',
// 	"path": '/name'
// }
// config1.paths 
// config2.paths 
// 

var _ = require('underscore');

function JDD(left, right){
  this.left = left;
  this.right = right;
  this.diffs = []
  this.compare();
}

JDD.prototype.EQUALITY = 'eq';
JDD.prototype.TYPE = 'type';
JDD.prototype.MISSING = 'missing';

JDD.prototype.findDiffs = function(/*Object*/ config1, /*Object*/ data1, /*Object*/ config2, /*Object*/ data2) {
       config1.currentPath.push('/');
       config2.currentPath.push('/');

       var key;
       var val;

       if (data1.length < data2.length) {
           /*
            * This means the second data has more properties than the first.
            * We need to find the extra ones and create diffs for them.
            */
           for (key in data2) {
               if (data2.hasOwnProperty(key)) {
                   val = data1[key];
                   if (!data1.hasOwnProperty(key)) {
                       this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                                       config2, this.generatePath(config2, '/' + key),
                                                       'The right side of this object has more items than the left side', this.MISSING));
                   }
               }
           }
       }

       /*
        * Now we're going to look for all the properties in object one and
        * compare them to object two
        */
       for (key in data1) {
           if (data1.hasOwnProperty(key)) {
               val = data1[key];

               config1.currentPath.push(key);
    
               if (!data2.hasOwnProperty(key)) {
                   /*
                    * This means that the first data has a property which
                    * isn't present in the second data
                    */
                   this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                                   config2, this.generatePath(config2),
                                                   'Missing property <code>' + key + '</code> from the object on the right side', this.MISSING));
                } else {
                    config2.currentPath.push(key);
                
                    this.diffVal(data1[key], config1, data2[key], config2);
                    config2.currentPath.pop();
                }
                config1.currentPath.pop();
           }
       }

       config1.currentPath.pop();
       config2.currentPath.pop();

       /*
        * Now we want to look at all the properties in object two that
        * weren't in object one and generate diffs for them.
        */
       for (key in data2) {
           if (data2.hasOwnProperty(key)) {
               val = data1[key];

               if (!data1.hasOwnProperty(key)) {
                   this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                                   config2, this.generatePath(config2, key),
                                                   'Missing property <code>' + key + '</code> from the object on the left side', this.MISSING));
               }
           }
       }
    },

     /**
     * Generate the differences between two values.  This handles differences of object
     * types and actual values.
     */
    JDD.prototype.diffVal = function(val1, config1, val2, config2) { 

        if (_.isArray(val1)) {
            this.diffArray(val1, config1, val2, config2);
        } else if (_.isObject(val1)) {
            if (_.isArray(val2) || _.isString(val2) || _.isNumber(val2) || _.isBoolean(val2)) {
                this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                                config2, this.generatePath(config2),
                                                'Both types should be objects', this.TYPE));
            } else {
                this.findDiffs(config1, val1, config2, val2);
            }
        } else if (_.isString(val1)) {
            if (!_.isString(val2)) {
                this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                                config2, this.generatePath(config2),
                                               'Both types should be strings', this.TYPE));
            } else if (val1 !== val2) {
                this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                                config2, this.generatePath(config2),
                                               'Both sides should be equal strings', this.EQUALITY));
            }
        } else if (_.isNumber(val1)) {
            if (!_.isNumber(val2)) {
                this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                                config2, this.generatePath(config2),
                                               'Both types should be numbers', this.TYPE));
            } else if (val1 !== val2) {
                this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                                config2, this.generatePath(config2),
                                               'Both sides should be equal numbers', this.EQUALITY));
            }
        } else if (_.isBoolean(val1)) {
            this.diffBool(val1, config1, val2, config2);
        } 
    },


    /**
     * Arrays are more complex because we need to recurse into them and handle different length
     * issues so we handle them specially in this function.
     */
    JDD.prototype.diffArray = function(val1, config1, val2, config2) {
        var _this = this;

        if (!_.isArray(val2)) {
           this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                           config2, this.generatePath(config2),
                                           'Both types should be arrays', this.TYPE));
        }

        if (val1.length < val2.length) {
            /*
             * Then there were more elements on the right side and we need to 
             * generate those differences.
             */
            for (var i = val1.length; i < val2.length; i++) {
                this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                                config2, this.generatePath(config2, '[' + i + ']'),
                                                'Missing element <code>' + i + '</code> from the array on the left side', this.MISSING));
            }
        }
        _.each(val1, function(arrayVal, index) {
            if (val2.length <= index) {
                _this.diffs.push(_this.generateDiff(config1, _this.generatePath(config1, '[' + index + ']'),
                                                config2, _this.generatePath(config2),
                                                'Missing element <code>' + index + '</code> from the array on the right side', _this.MISSING));
            } else {
                config1.currentPath.push('/[' + index + ']');
                config2.currentPath.push('/[' + index + ']');
                
                _this.diffVal(val1[index], config1, val2[index], config2);
                config1.currentPath.pop();
                config2.currentPath.pop();
            }
        });
    },
 /**
     * We handle boolean values specially because we can show a nicer message for them.
     */
    JDD.prototype.diffBool = function(val1, config1, val2, config2) { 
        if (!_.isBoolean(val2)) {
            this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                            config2, this.generatePath(config2),
                                            'Both types should be booleans', this.TYPE));
        } else if (val1 !== val2) {
            if (val1) {
                this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                                config2, this.generatePath(config2),
                                                'The left side is <code>true</code> and the right side is <code>false</code>', this.EQUALITY));
            } else {
                this.diffs.push(this.generateDiff(config1, this.generatePath(config1),
                                                config2, this.generatePath(config2),
                                                'The left side is <code>false</code> and the right side is <code>true</code>', this.EQUALITY));
            }
        }
    },

JDD.prototype.compare = function(){
  var left = this.left;
  var right = this.right;

   var config = this.createConfig();
      this.formatAndDecorate(config, left);
      // $('#out').text(config.out);

   var config2 = this.createConfig();
      this.formatAndDecorate(config2, right);
      // $('#out2').text(config2.out);

    config.currentPath = [];
    config2.currentPath = [];

    this.findDiffs(config, left, config2, right);
}

  JDD.prototype.startObject = function (config) {
        config.indent++;
        config.out += '{';

        if (config.paths.length === 0) {
            /*
             * Then we are at the top of the object and we want to add 
             * a path for it.
             */
            config.paths.push({
                path: this.generatePath(config),
                line: config.line
            });
        }
        
        if (config.indent === 0) {
            config.indent++;
        }
}

 /**
     * Finish the object, outdent, and pop off all the path
     */
    JDD.prototype.finishObject =  function(config) {
        if (config.indent === 0) {
            config.indent--;
        }

        this.removeTrailingComma(config);

        config.indent--;
        config.out += this.newLine(config) + this.getTabs(config.indent) + '}';
        if (config.indent !== 0) {
            config.out += ',';
        } else {
            config.out += this.newLine(config);
        }
    }

     JDD.prototype.formatVal =  function(val, config) { 
        var _this = this;

        if (_.isArray(val)) {
            config.out += '[';
            
            config.indent++;
            _.each(val, function(arrayVal, index) {
                config.out += _this.newLine(config) + _this.getTabs(config.indent);
                config.paths.push({
                    path: _this.generatePath(config, '[' + index + ']'),
                    line: config.line
                });

                config.currentPath.push('/[' + index + ']');
                _this.formatVal(arrayVal, config);
                config.currentPath.pop();
            });
            this.removeTrailingComma(config);
            config.indent--;

            config.out += this.newLine(config) + this.getTabs(config.indent) + ']' + ',';
        } else if (_.isObject(val)) {
            this.formatAndDecorate(config, val);
        } else if (_.isString(val)) {
            config.out += '"' + val.replace('\"', '\\"') + '",';
        } else if (_.isNumber(val)) {
            config.out += val + ',';
        } else if (_.isBoolean(val)) {
            config.out += val + ',';
        } else if (_.isNull(val)) {
            config.out += 'null,';
        } 
    }

    /**
     * Generate a JSON path based on the specific configuration and an optional property.
     */
    JDD.prototype.generatePath = function(config, prop) {
        var s = '';
        _.each(config.currentPath, function(path) {
            s += path;
        });

        if (prop) {
            s += '/' + prop;
        }

        if (s.length === 0) {
            return '/';
        } else {
            return s;
        }
    },

        /**
     * Add a new line to the output stream
     */
    JDD.prototype.newLine = function(config) {
        config.line++;
        return '\n';
    },

    /**
     * Sort all the relevant properties and return them in an alphabetical sort by property key
     */
    JDD.prototype.getSortedProperties =  function(/*Object*/ obj) {
        var props = [];

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                props.push(prop);
            }
        }

        props = props.sort(function(a, b) {
            return a.localeCompare(b);
        });

        return props;
    },

    /**
     * Generate the diff and verify that it matches a JSON path
     */
    JDD.prototype.generateDiff = function(config1, path1, config2, path2, /*String*/ msg, type) {
        if (path1 !== '/' && path1.charAt(path1.length - 1) === '/') {
            path1 = path1.substring(0, path1.length - 1);
        }

        if (path2 !== '/' && path2.charAt(path2.length - 1) === '/') {
            path2 = path2.substring(0, path2.length - 1);
        }

        var pathObj1 = _.find(config1.paths, function(path) {
            return path.path === path1;
        });

        var pathObj2 = _.find(config2.paths, function(path) {
            return path.path === path2;
        });

        if (!pathObj1) {
            throw 'Unable to find line number for(' + msg + '): ' + path1;
        }

        if (!pathObj2) {
            throw 'Unable to find line number for(' + msg + '): ' + path2;
        }

        return {
            path1: pathObj1,
            path2: pathObj2,
            type: type,
            msg: msg
        };
    },

    /**
     * Get the current indent level
     */
    JDD.prototype.getTabs = function(/*int*/ indent) {
        var s = '';
        for (var i = 0; i < indent; i++) {
            s += '    ';
        }

        return s;
    },

    /**
     * Remove the trailing comma from the output.
     */
    JDD.prototype.removeTrailingComma =  function(config) {
        /*
         * Remove the trailing comma
         */
        if (config.out.charAt(config.out.length - 1) === ',') {
            config.out = config.out.substring(0, config.out.length - 1);
        }
    }



JDD.prototype.formatAndDecorate = function (config, data) {
  this.startObject(config);
  config.currentPath.push('/');
  
  var props = this.getSortedProperties(data);
  
  /*
   * If the first set has more than the second then we will catch it
   * when we compare values.  However, if the second has more then
   * we need to catch that here.
   */
  
  var _this = this;
  
  _.each(props, function(key) {
      config.out += _this.newLine(config) + _this.getTabs(config.indent) + '"' + key + '": ';
      config.currentPath.push(key);
      config.paths.push({
          path: _this.generatePath(config),
          line: config.line
      });
      _this.formatVal(data[key], config);
      config.currentPath.pop();
  });

  this.finishObject(config);
  config.currentPath.pop();
} 

JDD.prototype.createConfig = function () {
   return {
      out: '',
      indent: -1,
      currentPath: [],
      paths: [],
      line: 1
  }; 
} 

function handle(left, right){
  try {
    if(typeof left == 'string') {
      left = JSON.parse(left);
    }
   
  } catch(e) {
    console.log('local is not a valid json');
  }

  try {
    if(typeof right == 'string') {
      right = JSON.parse(right);
    }
  } catch(e) {
    console.log('remote is not a valid json');
  }
 
  var jdd = new JDD(left, right);
  var diffs = _.filter(jdd.diffs, function (diff) {
    return diff.type != 'eq';
  });
  return diffs;
}

module.exports = handle;