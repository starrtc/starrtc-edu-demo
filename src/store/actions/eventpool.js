import { observable, computed, action, configure } from "mobx";

import defaultConfig from "../config";
import { Valid } from "util";

configure({ enforceActions : 'always' });

export default class {
  @observable
  state = {
    remoteTrackNotifications: {} //remote
  };

  @action
  clearRemoteTrackNotifications() {
    this.state.remoteTrackNotifications = {};
    console.log("store --> eventpool --> clearRemoteTrackNotifications");
  }

  @action
  addRemoteTrackNotification(account) {
    if (this.state.remoteTrackNotifications[account]) {
      console.log("已通知的远程轨道：", account);
      return;
    }
    this.state.remoteTrackNotifications[account] = 1;
    console.log("store --> eventpool --> addRemoteTrackNotification", account);
  }
}
