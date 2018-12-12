/*

 * 聊天室区域
 */

import React, { Component } from "react";
import { observer } from "mobx-react";

import classNames from "classnames";

import Chat from "./chat";
import Member from "./member";

import { StoreNim, StoreChatroom, StoreNetcall } from "../../store";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

@observer
export default class extends Component {

  showChatPanel = e => {
   ChatroomAction.setIsShowMemberTab(false);
  };

  showMemberPanel = e => {
    ChatroomAction.setIsShowMemberTab(true);

    //清除红点
    ChatroomAction.setHasPermissionRequest(false);
  };

  render() {
    const { children, className } = this.props;
    return (
      <div className="m-chatroom">
        <div className="u-tab">
          <div className="u-tab-header">
            <div
              className={classNames(
                "u-tab-item u-tab-item-small",
                !ChatroomState.isShowMemberTab ? "active" : ""
              )}
              onClick={this.showChatPanel}
            >
              讨论
            </div>
            <div
              className={classNames(
                "u-tab-item u-tab-item-small",
                ChatroomState.isShowMemberTab  ? "active" : ""
              )}
              onClick={this.showMemberPanel}
            >
              成员
              {!ChatroomState.isShowMemberTab   &&
                ChatroomState.hasPermissionRequest && (
                  <i className="pointer"> </i>
                )}
            </div>
          </div>
          <div className="u-tab-body">
            {!ChatroomState.isShowMemberTab  ? <Chat /> : <Member />}
          </div>
        </div>
      </div>
    );
  }
}
