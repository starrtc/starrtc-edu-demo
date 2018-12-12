/*

 * 基本类型检查
 */
function typeOf(obj) {
  return obj && obj.constructor;
}

export default {
  isString(obj) {
    return typeOf(obj) === String;
  },
  isNumber(obj) {
    return typeOf(obj) === Number;
  },
  isBoolean(obj) {
    return typeOf(obj) === Boolean;
  },
  isArray(obj) {
    return typeOf(obj) === Array;
  },
  isFunction(obj) {
    return typeOf(obj) === Function;
  },
  isUndefined(obj) {
    return typeOf(obj) === undefined;
  },
  isNull(obj) {
    return typeOf(obj) === null;
  },
  isBlank(data) {
    return data == "" || data.trim().length == 0;
  },

  // 去除空格
  removeSpace(data) {
    const reg = /(^\s*)|(\s*$)/g;
    const that = this;
    if (!data) return "";
    switch (data.constructor) {
      case String:
        return data.replace(reg, "");
      case Array:
        return data.map(item => that.removeSpace(item));
      case Object:
        Object.keys(data).map(
          item => (data[item] = that.removeSpace(data[item])),
          data
        );
        return data;
      default:
        return data;
    }
  },
  // 对象参数校验, 需要校验的字段用空格分隔为字符串
  param(obj = {}, name) {
    if (!name) return true;
    name = name.split(" ");
    try {
      name.map(item => {
        if (!obj[item]) throw Error("no");
      });
    } catch (e) {
      return false;
    }
    return true;
  },
  encode(_map, _content) {
    _content = "" + _content;
    if (!_map || !_content) {
      return _content || "";
    }
    return _content.replace(_map.r, function($1) {
      var _result = _map[!_map.i ? $1.toLowerCase() : $1];
      return _result != null ? _result : $1;
    });
  },
  escape(_content) {
    let _reg = /<br\/?>$/;
    let _map = {
      r: /\<|\>|\&|\r|\n|\s|\'|\"/g,
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      " ": "&nbsp;",
      '"': "&quot;",
      "'": "&#39;",
      "\n": "<br/>",
      "\r": ""
    };
    _content = this.encode(_map, _content);
    return _content.replace(_reg, "<br/>");
  }
};
