/*

 * 音视频区域
 */

import React, { Component } from 'react';
import { observer } from "mobx-react";

import classNames from 'classnames';
import Video from './video';

import { StoreNim, StoreChatroom, StoreNetcall } from "store";

import { Page, Storage } from "util";

import EXT_NIM from "ext/nim";
import EXT_CHAT from "ext/chatroom";
import EXT_NETCALL from "ext/webrtc";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

// 测试数据
const test = [1, 2, 3, 4];

@observer
export default class extends Component {
  render() {
    const { children, className } = this.props;
    return (
      <div className={classNames('m-netcall', className)}>
        {test.map((item, index) => (
          <Video key={index} className={"video-"+(index+1)}/>
        ))}
      </div>
    );
  }
}
