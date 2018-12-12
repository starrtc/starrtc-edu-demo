/*

 * 白板区域
 */

import React, { Component } from "react";
import classNames from "classnames";
import { observer } from "mobx-react";

import WB from "./wb";
import ScreenShare4Teacher from "./screen.teacher";
import ScreenShare4Student from "./screen.student";

import { Storage } from "../../util";

import { StoreNim, StoreChatroom, StoreWhiteBoard, StoreNetcall } from "../../store";
import EXT_NIM from "../../ext/nim"

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

@observer
export default class extends Component {
  state = {
    tabIndex: 0
  }

  showWhiteboardPanel = e => {
    // webrtc未初始化完成或者屏幕共享已点击 return
    if (!(NetcallState.webrtc && NetcallState.webrtc.startDevice) || NetcallState.hasShareScreen) {
      return
    }
    NetcallAction.settabindex(0)
    NetcallAction.setShareStarted(false)
    const isTeacher = Number(Storage.get('isTeacher'))
    if (isTeacher == 1) {
      this.startCamera()
    }
    if (ChatroomState.custom) {
      ChatroomState.custom.fullScreenType = 0 //标记屏幕共享状态 不共享
      EXT_NIM.updateChatroom(ChatroomState.custom)
    }
  }

  showScreenSharePanel = e => {
    // webrtc未初始化完成或者屏幕共享已点击 return
    if (!(NetcallState.webrtc && NetcallState.webrtc.startDevice)) {
      return
    }
    NetcallAction.settabindex(1)
    this.shareScreen()
  }
  startCamera() {
    if (NetcallState.hasVideo && NetcallState.video) {
      //启用新设备并渲染画面
     
    } else {
      // 延时处理 否则对端视频可能未关闭
      
    }
  }
  /**
   *屏幕共享
   */
  shareScreen() {
    const ua = window.navigator.userAgent;
    const isChrome = ua.indexOf("Chrome") && window.chrome;
    if (!isChrome) {
      return
    }
    if (!NetcallState.hasShareScreen) {
      NetcallAction.setHasShareScreen(true);
      NetcallAction.setScreenShareing4Local(true);
      NetcallAction.setChromeDown(false)
      
    }

  }
  render() {
    const isTeacher = Number(Storage.get('isTeacher'))
    const { children, className } = this.props
    const state = this.state
    // 学生端屏幕共享有文案变更
    let text = (NetcallState.screenShareing4Local && isTeacher!=1) ? '屏幕共享' : '白板' 
    return (
      <div className="m-whiteboard">
        <div className="u-tab">
          <div className="u-tab-header u-tab-header-big">
            <div
              className={classNames(
                'u-tab-item u-tab-item-big',
                NetcallState.tabIndex == 0 ? 'active' : ''
              )}
              onClick={this.showWhiteboardPanel}
            >
              {text}
            </div>
            {0 == 1 && (
              <div
                className={classNames(
                  'u-tab-item u-tab-item-big',
                  NetcallState.tabIndex == 1 ? 'active' : ''
                )}
                onClick={this.showScreenSharePanel}
              >
                屏幕共享
              </div>
            )}
          </div>
          <div className="u-tab-body">
            <WB visible={NetcallState.tabIndex == 0} />
            {isTeacher == 1 ? (
              <ScreenShare4Teacher
                visible={NetcallState.tabIndex == 1}
              />
            ) : (
              <ScreenShare4Student
                className="m-whiteboard-video m-whiteboard-container-cover"
                visible={NetcallState.screenShareing4Local}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}
