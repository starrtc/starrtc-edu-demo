/*

 * 
 * 日志美化库
 */

const colorMap = {
  info: 'blue',
  log: '#3d6dad',
  warn: 'orange',
  error: 'red'
};
const logger = {
  init() {
    this.loggerInfo = console.info;
    this.loggerWarn = console.warn;
    this.loggerError = console.error;
    this.loggerLog = console.log;

    this.reset();
  },
  reset() {
    var that = this;
    window.console.info = function() {
      that.logProxy(['info', ...arguments]);
    };
    window.console.log = function() {
      that.logProxy(['log', ...arguments]);
    };
    window.console.warn = function() {
      that.logProxy(['warn', ...arguments]);
    };
    window.console.error = function() {
      that.logProxy(['error', ...arguments]);
    };
  },
  logProxy() {
    const params = arguments[0];
    if (params.length === 1) return;
    const type = params[0];
    const style = `color:${colorMap[type]};font-size:15px`;
    params.shift();
    params[0] = `%c${params[0]}`;
    params.splice(1, 0, style);
    // call(参数一个个传递) & apply(参数数组传递)
    this.loggerLog.apply(console, params);
  },
  // 装饰器log
  log: type => {
    const logger = console;
    return (target, name, descriptor) => {
      console.log(target, name, descriptor);
      const method = descriptor.value;
      descriptor.value = (...args) => {
        logger.info(`(${type}) before function execute: ${name}(${args}) = ?`);
        let ret = method.apply(target, args);
        logger.info(
          `(${type})after function execute: ${name}(${args}) => ${ret}`
        );
        return ret;
      };
    };
  }
};

console.log('logger', logger)
export default {
  init: logger.init.bind(logger),
  log: logger.log
};
