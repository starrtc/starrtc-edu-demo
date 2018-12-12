/*

 * 本地存储工具方法, 默认采用 sessionStorage
 */

const storage = window.sessionStorage || window.localStorage;
export default {
  get(name) {
    return storage.getItem(name);
    // return localStorage.getItem(name);
  },
  set(name, value) {
    if (!name) return;
    storage.setItem(name, value);
  },
  remove(name) {
    storage.removeItem(name);
  },
  clean() {
    storage.clear && storage.clear();
  }
};
