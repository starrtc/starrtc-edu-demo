/*

 * 聊天室消息发送
 */

import React, { Component } from "react";
import { observer } from "mobx-react";

import classNames from "classnames";
import { TextArea, Button, EmojiPanel } from "../../component";

import { Valid, Toast } from "../../util";
import { StoreNim, StoreChatroom, StoreNetcall  } from "../../store";

import EXT_ROOM from "../../ext/room";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

@observer
export default class extends Component {
  state = {
    msg: "",
    sendLoading: false,
    canSendMsg: false,
    showEmojiPanel: false
  };

  changeMsg = e => {
    const msg = e.target.value;
    if (Valid.isBlank(msg)) {
      this.setState({
        msg: "",
        canSendMsg: false
      });
      return;
    }

    this.setState({
      msg: e.target.value,
      canSendMsg: true
    });
  };

  sendMsg = e => {
    console.log("sendMsg ...");
    const tmp = Valid.removeSpace(this.state);
    if (!Valid.param(tmp, "msg")) {
      Toast({
        msg: "请输入聊天内容"
      });
      return;
    }

    EXT_ROOM.sendChatroomMsg(this.state.msg)
      .then(() => {
        console.log("发送消息成功");

        this.setState({
          msg: ""
        });
      })
      .catch((error) => {
        console.error("发送消息失败", error);

        Toast({
          msg: "发送消息失败"
        });
      });
  };

  sendCqMsg = e => {
    console.log("发送猜拳消息");
    EXT_ROOM.sendCqMsg()
      .then(() => {
        console.log("猜拳发送成功...");
      })
      .catch(error => {
        console.error("猜拳发送失败...", error);
      });
  };

  toggleBqPanel = e => {
    console.log("表情面板显示/隐藏...");
    ChatroomAction.setShowEmojiPanel(!ChatroomState.showEmojiPanel);
  };

  //追加emoji表情文案到输入框
  doAppendEmoji = emoji => {
    console.log("追加表情文案：", emoji);
    this.setState((prevState, props) => ({
      msg: prevState.msg + " " + emoji,
      canSendMsg: true
    }));
  };

  render() {
    return (
      <div className="m-chatroom-input">
        <TextArea
          className="msg-input"
          onChange={this.changeMsg}
          placeholder="和大家一起愉快聊天"
          value={this.state.msg}
        />
        <div className="input-toolbar">
          <div className="part part-1">
            <Button
              className="u-btn u-btn-smaller"
              onClick={this.sendMsg}
              disabled={!this.state.canSendMsg}
              loading={this.state.sendLoading}
            >
              发送
            </Button>
          </div>
          <div className="part part-2">
            <span className="cq" onClick={this.sendCqMsg} />
          </div>
          <div className="part part-3">
            <span className="emojis" onClick={this.toggleBqPanel} />
          </div>
        </div>
        {ChatroomState.showEmojiPanel && <EmojiPanel fn={this.doAppendEmoji} />}
      </div>
    );
  }
}
