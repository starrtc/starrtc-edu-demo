import EXT_NIM from "../ext/nim";
import EXT_WHITEBOARD from "../ext/whiteboard";
import EXT_EVENTPOOL from "../ext/eventpool";
import EXT_ROOM from "../ext/room";

import { StoreNim, StoreChatroom, StoreNetcall, StoreEventPool } from "../store";
import { Storage } from "../util";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;
const EventPoolAction = StoreEventPool;
const EventPoolState = StoreEventPool.state;

/**
 * 公用流程处理器，将多端流程线性统一
 */
export default {
  /**
   * 将RTC房间的权限控制（聊天室或点对点消息+WEBRTC事件归一）
   */
  handleRtcPermissionAndDraw(account, targetIndex = undefined, streamObj = undefined) {
    console.log(
      "******* handleRtcPermissionAndDraw(权限与绘制归一处理器) ********* "
    );

    console.log(account, targetIndex);

    if (this.findRtcUserIndex(account) == -1) {
      console.warn("#### 等待对应账号的有权限的点对点消息通知，尚未进入房间...");
      return;
    }

    const teacherAccount = Storage.get("teacherAccount");
    if (
      teacherAccount == account &&
      NetcallState.video4ScreenSharing &&
      NetcallState.screenShareing4Local
    ) {
      //如果是老师且在屏幕共享状态下切换显示中
      this.renderRemoteVideo4ScreenShareing(account);
    } else {
      //渲染远程画面到节点
      this.renderRemoteVideo(account, targetIndex, streamObj);
    }
  },

  /**
   * 渲染远端指定账号的画面到对应DOM
   */
  renderRemoteVideo(account, targetIndex = undefined, streamObj = undefined) {
    const index =
      targetIndex == undefined ? this.findRtcUserIndex(account) : targetIndex;
    if (index == -1) {
      console.error("---------- 未找到的互动成员：", account);
      return;
    }

    console.log("*** 设置远程视频画面：", account, NetcallState.doms[index]);
	EXT_ROOM.startRemoteStream(account, NetcallState.doms[index], streamObj);
  },

  /**
   * 老师如果在屏幕共享中，则渲染放大显示
   * @param {String} account 账号
   */
  renderRemoteVideo4ScreenShareing(account) {
    const dom = document.getElementById("m-whiteboard-fullscreen");
  },

  /**
   * 查找指定账号是否在RTC房间中
   */
  findRtcUserIndex(account) {
    const index = NetcallAction.findMember({
      account: account
    });
    return index;
  }
};
