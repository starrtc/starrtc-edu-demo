import React, { Component } from "react";
import classNames from "classnames";
import env from "../../env";
import emojiData from "./emoji-data";

import { StoreChatroom, StoreNetcall } from "../../store";

///import EXT_CHAT from "ext/chatroom";
import EXT_ROOM from "../../ext/room";

const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

export default class extends Component {
  state = {
    emoji: this.genEmojiList("emoji", emojiData.emojiList),
    pinup: this.genEmojiList("pinup", emojiData.pinupList),
    currType: "emoji",
    currAlbum: "emoji",
    currEmoji: []
  };

  //获取当前类型下的表情/贴图集
  getCurrEmoji(currType, currAlbum) {
    if (currType == "emoji") {
      return this.state.emoji[currAlbum];
    } else if (currType == "pinup") {
      return this.state.pinup[currAlbum];
    } else {
      return [];
    }
  }

  //选择当前类别
  selectAlbum(album) {
    console.log("select -> ", album.type);
    this.setState({
      currType: album.type,
      currAlbum: album.name,
      currEmoji: this.getCurrEmoji(album.type, album.name)
    });
  }

  //选择一个表情
  selectEmoji(emoji) {
    console.log("选中条目:", emoji);

    if (emoji.type == "emoji") {
      console.log("添加一个表情文案到输入框： ");
      this.props.fn && this.props.fn(emoji.key);
      ChatroomAction.setShowEmojiPanel(false);
    } else {
      console.log("发送贴图消息");
      EXT_ROOM.sendPinupMsg(emoji.name, emoji.key)
        .then(() => {
          console.log("贴图消息发送成功...");
          ChatroomAction.setShowEmojiPanel(false);
        })
        .catch(error => {
          console.log("贴图消息发送失败...");
          ChatroomAction.setShowEmojiPanel(false);
        });
    }
  }
  //生成格式化的数组
  genEmojiList(type, emojiList) {
    let result = {};
    for (let name in emojiList) {
      let emojiMap = emojiList[name];
      let list = [];
      for (let key in emojiMap) {
        list.push({
          type,
          name,
          key,
          img: emojiMap[key].img
        });
      }
      if (list.length > 0) {
        result[name] = {
          type,
          name,
          list,
          album: list[0].img
        };
      }
    }
    console.log(result);
    return result;
  }

  componentDidMount() {
    console.log("emojiPanel componentDidMount ... ");
    this.setState({
      currEmoji: this.getCurrEmoji(this.state.currType, this.state.currAlbum)
    });
  }

  render() {
    const state = this.state;
    return (
      <div className="m-emoji">
        <div className="emoji-tab">
          {Object.keys(state.emoji).map(key => {
            return (
              <div
                key={"emoji-" + key}
                className={classNames(
                  "emoji-tab-item",
                  state.emoji[key].name == state.currAlbum ? "active" : ""
                )}
                onClick={this.selectAlbum.bind(this, state.emoji[key])}
              >
                <img src={state.emoji[key].album} />
              </div>
            );
          })}
          {Object.keys(state.pinup).map(key => {
            return (
              <div
                key={"pinup-" + key}
                className={classNames(
                  "emoji-tab-item",
                  state.pinup[key].name == state.currAlbum ? "active" : ""
                )}
                onClick={this.selectAlbum.bind(this, state.pinup[key])}
              >
                <img src={state.pinup[key].album} />
              </div>
            );
          })}
        </div>
        <div className="emoji-content">
          {state.currEmoji &&
            state.currEmoji.list &&
            state.currEmoji.list.map((item, index) => {
              return (
                <span
                  key={state.currAlbum + "-" + index}
                  className={classNames(
                    "emoji-item",
                    state.currType == "pinup" ? "emoji-pinup-item" : ""
                  )}
                  onClick={this.selectEmoji.bind(this, item)}
                >
                  <img
                    src={
                      item.img +
                      ("?imageView&thumbnail=" +
                        (state.currType == "emoji" ? "28x28" : "48x48"))
                    }
                  />
                </span>
              );
            })}
        </div>
      </div>
    );
  }
}
