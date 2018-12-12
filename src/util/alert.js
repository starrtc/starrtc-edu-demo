/*

 * 弹框简单再封一层通用方法
 */

import { AlertCtrl } from "../component/alert";
import valid from "./valid";

export default {
  open(option = {}) {
    const { className, title = "提示", msg, btns = [], close, isHtml } = option;
    const param = {
      className: className,
      title: title,
      msg:
        msg && msg.$$typeof
          ? msg
          : msg.constructor === String ? msg : JSON.stringify(msg),
      btns,close,
      isHtml
    };
    AlertCtrl.show(param);
  },
  close() {
      console.log('门面方法调用...');
    AlertCtrl.hide();
  }
};
