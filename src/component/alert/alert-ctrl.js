/*
 * 弹框控制器
 * 注：在页面第一次加载dom还未mount之前调用该方法可能报错，这里对第一次加载做个200ms延时
 */

import Alert from './alert';


// wait多少时间
const waitSecond = async (time = 0.2) =>
  new Promise((resolve, reject) => setTimeout(resolve, time * 1000));

export default class AlertCtrl {
  static _instance = null;

  static async createInstance(inProps) {
    if (this._instance) return this._instance;

    console.log('now', Date.now());
    await waitSecond();
    console.log('now', Date.now());

    this._instance = Alert.newInstance(inProps);
    return this._instance;
  }

  static async show(inOptions) {
    // console.log('alert show inOptions', inOptions);
    if (!this._instance) {
      this._instance = await this.createInstance(inOptions);
    }
    return this._instance.show(inOptions);
  }

  static hide() {
    return this._instance && this._instance.hide();
  }

  static destory() {
    this._instance && this._instance.destory();
    this._instance = null;
  }
}
