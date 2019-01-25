/*

 * 初始化IM连接
 */
import React, { Component } from "react";
import $ from 'jquery';
import env from "../env";
import { Ajax, Alert, Toast, Loading, Valid, MD5, Storage, Page } from "../util";
import { ConfirmDeviceContent } from "../component/alert-content";

import { StoreNim, StoreChatroom, StoreNetcall, StoreEventPool } from "../store";

import EXT_WHITEBOARD from '../ext/whiteboard';

const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NimState = StoreNim.state;
const NimAction = StoreNim;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;
const EventPoolAction = StoreEventPool;
const EventPoolState = StoreEventPool.state;
const agentId = "stargWeHN8Y7";

// SDK插件注册

export default {
  // 注册逻辑
  regist(param) {
    
  },

  getAuthKey(account) {
	 return $.get("https://api.starrtc.com/public/authKey.php?userid="+account+"&appid="+agentId)
      .then((data, status) => {
			if(status === "success"){
				var obj = JSON.parse(data);
				if(obj.status == 1){
					return Promise.resolve(obj.data); 
				}
				else
				{
					return Promise.reject(obj.data);
				}
			}
			else
			{
				return Promise.reject();
			}
      })
      .catch(err => {
        return Promise.reject(err);
      });
  },
  
  // 初始化NIM SDK, 登录
  login(account, token, authKey = undefined) {
    const that = this;
	if (NimState.nim) {
      console.log('=== 已存在的nim实例， 不再重新初始化...');
      return Promise.resolve();
    }
	
    if (!account || !token) {
      return Promise.reject("请输入登录名和密码");
    }
	return new Promise((resolve ,reject) => {
		if(authKey)
		{
			window.StarRtc.Instance.login(agentId,account,authKey,
						(data, status) =>{
							switch (status){
							case "connect success":
							NimAction.setNim(window.StarRtc.Instance);
							NimAction.setAccount(account);
							NimAction.setToken(token);
							return resolve(authKey);
							case "connect failed":
							return reject("connect failed");
							}
						});
		}
		else
		{
			that.getAuthKey(account)
			.then(authKey => {
				window.StarRtc.Instance.login(agentId,account,authKey,
						(data, status) =>{
							switch (status){
							case "connect success":
							NimAction.setNim(window.StarRtc.Instance);
							NimAction.setAccount(account);
							NimAction.setToken(token);
							return resolve(authKey);
							case "connect failed":
							return reject("connect failed");
							}
						});
			})
			.catch(err => {
				return reject(err);
			});
		}
	});
  },

  onCustomSysMsg(msg) {
    console.log("收到onCustomSysMsg: ", msg);

  },

  //自定义IM消息
  sendCustomMsg(to, data) {
    
  },

  sendCustomSysMsg(to, data) {
    
  },
  //更新聊天室信息
  updateChatroom(data) {
    
  },
  onMsg(msg) {
    console.log("收到im消息onMsg: ", msg);
  },

  doConfirmDevice() {
    Alert.close();
    console.log(
      "互动模式",
      "audio: ",
      NetcallState.audio,
      ", video: ",
      NetcallState.video
    );

    NetcallAction.setHasPermission(true);
    NetcallAction.addMember({
      account: NimState.account,
      self: true
    });
    ChatroomAction.setMemberStatus(NimState.account, 1);
    // 白板本地行为
    EXT_WHITEBOARD.changeRoleToPlayer();
    EXT_WHITEBOARD.checkColor()

    // 音视频本地行为(麦克风、摄像头、画面等)
    if (NetcallState.hasAudio && NetcallState.audio) {
     
    }
    if (NetcallState.hasVideo && NetcallState.video) {
     
    }

  },

  doEndInteraction4CurrentStudent() {
	// 白板设置为观众
    EXT_WHITEBOARD.changeRoleToAudience();
    //本地行为及控制指令通知（麦克风、摄像头、画面）
    const findIdx = NetcallState.members.findIndex(item => {
      return item.account == NimState.account;
    });
    if (findIdx == -1) {
      console.error("未找到对应DOM节点,无法停止流...");
    } else {
      //EXT_NETCALL.stopLocalStream(NetcallState.doms[findIdx]);
    }
    NetcallAction.delMember(NimState.account);
    NetcallAction.setHasPermission(false);
    NetcallAction.setShowStatus(0);

    ChatroomAction.setMemberStatus(NimState.account, 0);
  },

  //退出NIM SDK
  logout() {
	window.StarRtc.Instance.logout();
	
	NimAction.setAccount("");
    NimAction.setToken("");

    //原nim对象清除
    NimAction.setNim(null);

    Storage.remove("account");
    Storage.remove("token");
	Storage.remove("authKey");

    Page.to("login");
  }
};
