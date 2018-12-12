import React, { Component } from "react";
import classNames from "classnames";
import { observer } from "mobx-react";

import { StoreNim, StoreChatroom, StoreNetcall, StoreWhiteBoard } from "../../store";
import { Storage } from "../../util";

import EXT_NIM from "../../ext/nim";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

@observer
export default class extends Component {
  //退出大屏
  exitFullScreen = e => {
    NetcallAction.setScreenShareing4Local(false);
    const teacherAccount = Storage.get("teacherAccount");

    //默认窗口显示
    const index = NetcallAction.findMember({
      account: teacherAccount
    });
    console.log("### 缩小", index, NetcallState.doms[index], teacherAccount);

  };

  render() {
    const { className, visible } = this.props;
    let html = '';
    if (NetcallState.screenShareing4Local) {
      html = <div className="video-fullscreen-box">
        <div className="exit-fullscreen" onClick={this.exitFullScreen} />
        <div className="video-fullscreen" onClick={this.launchFullscreen.bind(this)} />
      </div>
      
    }
    return (
      <div className={classNames(
            "m-fullscreen-box",
            visible ? "" : "hide"
          )}>
          <div
          id="m-whiteboard-fullscreen"
          className={classNames(
            "m-whiteboard-container",
            className,
            visible ? "" : "hide"
          )}
        >
        </div>
        {html}
      </div>
    );
  }
  /**
   * 显示全屏
   * @param {Object} element
   */
  launchFullscreen(element) {
    var element = document.querySelector('#m-whiteboard-fullscreen video')
    if (!element) {
      return;
    }
    if(element.requestFullscreen) {
      element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if(element.msRequestFullscreen){
      element.msRequestFullscreen();
    } else if(element.webkitRequestFullscreen) {
      element.webkitRequestFullScreen();
    }
    element.removeEventListener('click', this.videoExitFullscreen)
    element.addEventListener('click', this.videoExitFullscreen)
  }
  /**
   *退出全屏
   */
  videoExitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}
