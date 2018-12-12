/*

 * 聊天室消息列表
 */

import React, { Component } from "react";
import { observer } from "mobx-react";
import renderHTML from "react-render-html";
import classNames from "classnames";

import { Button } from "../../component";
import { StoreNim, StoreChatroom, StoreNetcall } from "../../store";

const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

@observer
export default class extends Component {
  state = {
    historyLoading: false //加载中
  };

  componentDidMount() {
    console.log("chat.list componentDidMount: ");
    //组件加载时设置时间戳
    ChatroomAction.setLastTimestamp(Date.now());
  }
  loadHistoryMsg = e => {
    console.log("点击加载历史消息按钮...");
    if (this.state.historyLoading) {
      console.log("正在加载中，忽略重复点击 ...");
      return;
    }

    //设置为正在加载中
    this.setState({
      historyLoading: true
    });

  };

  render() {
    return (
      <div id="chat-msg-list" className="m-chatroom-list">
        {ChatroomState.canLoadHistory && (
          <div className="history-toolbar">
            <Button
              className="u-btn-none f-w-140"
              onClick={this.loadHistoryMsg}
              loading={this.state.historyLoading}
            >
              加载历史消息
            </Button>
          </div>
        )}
        {ChatroomState.msgs.map(
          (item, index) =>
            item && item.type == "notification" ? (
              <div key={index} className="msg msg-notification">
                {item.content}
              </div>
            ) : item && item.type == "text" ? (
              <div key={index} className="msg">
                {item.avatar ? (
                  <div
                    className="avatar"
                    style={{
                      backgroundImage: "url(" + item.avatar + ")"
                    }}
                  />
                ) : (
                  <div className="avatar" />
                )}
                <div className="content">
                  <div className="nick">{item.nick}</div>
                  <div className="value">{renderHTML(item.content)}</div>
                </div>
              </div>
              ) : item && item.type == "caiquan" ? (
              <div key={index} className="msg">
                {item.avatar ? (
                  <div
                    className="avatar"
                    style={{
                      backgroundImage: "url(" + item.avatar + ")"
                    }}
                  />
                ) : (
                  <div className="avatar" />
                )}
                <div className="content">
                  <div className="nick">{item.nick}</div>
                  <div className="value">
                    <img
                      src={item.content}
                      style={{
                        width: 50,
                        height: 50
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : item && item.type == "emoji" ? (
              <div key={index} className="msg">
                {item.avatar ? (
                  <div
                    className="avatar"
                    style={{
                      backgroundImage: "url(" + item.avatar + ")"
                    }}
                  />
                ) : (
                  <div className="avatar" />
                )}
                <div className="content">
                  <div className="nick">{item.nick}</div>
                  <div className="value">
                    <img
                      src={item.content}
                      style={{
                        width: item.catalog == "emoji" ? 28 : 48,
                        height: item.catalog == "emoji" ? 28 : 48
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )
        )}
      </div>
    );
  }
}
