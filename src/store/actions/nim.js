/*

 * IM状态保持
 */

import { observable, computed, action, configure } from 'mobx';

configure({ enforceActions: 'always' });

console.log('Storage', Storage);

export default class {
  @observable
  state = {
    agentId: "stargWeHN8Y7",
    account: '',
    token: '',
    nim: null, //NIM SDK对象
    hasReceiveHostMsg: false //是否已收到主持人发送的有权限成员列表的消息
  };

  @action
  setHasReceiveHostMsg(hasReceiveHostMsg) {
    this.state.hasReceiveHostMsg = hasReceiveHostMsg;
    console.log('store --> nim --> setHasReceiveHostMsg', hasReceiveHostMsg);
  }

  @action
  setNim(nim) {
    console.log('store --> nim --> setNim', nim);
    this.state.nim = nim;
  }

  @action
  setUid(uid) {
    console.log('store --> nim --> setUid', uid);
    this.state.uid = uid;
  }

  @action
  setAccount(account) {
    console.log('store --> nim --> setAccount', account);
    this.state.account = account;
  }

  @action
  setToken(token) {
    console.log('store --> nim --> setToken', token);
    this.state.token = token;
  }
}
