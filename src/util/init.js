/*

 * 
 * 日志美化库
 */
import platform from 'platform';
import logger from './logger';
import asynLoad from './asynLoad';

const home = {
  init() {
    this.initMobile().then(() => {
    //   // console.log(platform)
      // setTimeout(() => this.lazyLoad(), 2000)
      // this.lazyLoad();
    });
  },
  lazyLoad() {
    asynLoad(['lib/md5.js', 'lib/qs.min.js', 'lib/axios.min.js']);
  },
  initMobile() {
    // if(1) return Promise.resolve();
    if (!/(ios|android)/gi.test(platform.os.family)) {
      return Promise.resolve();
    }
    return asynLoad('lib/vconsole.min.js').then(() => {
      console.log(platform);
    });
  }
};

home.init();
