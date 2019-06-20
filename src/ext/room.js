/*

 * 初始化IM连接
 */
import React, { Component } from "react";
import "@babel/polyfill";
import env from "../env";
import $ from 'jquery';
import { Ajax, Alert, Toast, Loading, Valid, MD5, Storage, Page } from "../util";
import { ConfirmDeviceContent } from "../component/alert-content";
import emojiData from "../component/emoji/emoji-data";

import { StoreNim, StoreNetcall, StoreChatroom, StoreEventPool } from "../store";

import EXT_ROOM from "../ext/room";
import EXT_EVENTPOOL from "../ext/eventpool";
import EXT_WHITEBOARD from "../ext/whiteboard";

const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NimState = StoreNim.state;
const NimAction = StoreNim;
const EventPoolAction = StoreEventPool;
const EventPoolState = StoreEventPool.state;
// SDK插件注册

export default {
  getClassRoomList() {
    return new Promise((resolve, reject) => {
      if (window.StarRtc.Instance.configModePulic) {
        $.get(window.StarRtc.Instance.workServerUrl + "/class/list.php?appid=" + NimState.agentId).then((data, status) => {
          if (status === "success") {
            var obj = JSON.parse(data);
            if (obj.status === 1) {
              ChatroomAction.setRooms(obj.data);
              resolve();
            } else {
              reject();
            }
          } else {
            reject();
          }
        });
      }
      else {
        window.StarRtc.Instance.queryVideoClassRoom((status, listData) => {
          ChatroomAction.setRooms(listData);
          resolve();
        });
      }
    });
  },

  async createRoom(roomInfo, userId, joinFlag = false) {
    const that = this;
    const isTeacher = Number(Storage.get("isTeacher"));
    if (joinFlag) {

    }
    else {
      roomInfo.Type = 0;
      roomInfo.ID = "";
    }

    return new Promise((resolve, reject) => {
      var starRtc = NimState.nim;
      var currRoom = starRtc.getVideoLiveRoomSDK("src", joinFlag ? "open" : "new",
        (data, status, oper) => {
          var thisRoom = data.obj;
          switch (status) {
            //链接状态
            case "connect success":
              switch (oper) {
                case "open":
                  thisRoom.createStream({
                    "video": { width: { ideal: 184 }, height: { ideal: 137 }, facingMode: { ideal: ["user"] } },
                    "audio": { deviceId: { ideal: ["default"] } }
                  });
                  break;
                case "new":
                  thisRoom.createNew();
                  break;
              }
              break;
            case "connect failed":
              reject("connect failed");
              break;
            case "connect closed":
              break;
            case "onWebrtcMessage":
              {
                switch (data.type) {
                  case "streamCreated":
                    if (data.status == "success") {
                      switch (oper) {
                        case "open":
                          thisRoom.joinRoom();
                          break;
                        case "new":
                          thisRoom.joinRoom();
                          break;
                      }
                    }
                    else {
                      reject("获取摄像头视频失败！请检查摄像头设备是否接入！");
                    }
                    break;
                  case "srcApplyUpload":
                    if (data.status == "success") {
                      ChatroomAction.addMember(
                        that.createMember4Component(
                          NimState.account == data.userData.roomInfo.Creator ? "owner" : "guest",
                          NimState.account,
                          "",
                          NimState.account,
                          ""
                        )
                      );
                      ChatroomAction.setChatroom(data.userData.roomInfo.ID, currRoom);
                      ChatroomAction.setCurrChatroomId(data.userData.roomInfo.ID);
                      NetcallAction.setRoom(currRoom);
                      resolve(data.userData.roomInfo.ID);
                    }
                    else {
                      reject("上传视频申请失败！");
                      console.log("收到_webrtc_apply_failed");
                    }
                    break;
                  case "addUploader":

                    var upUserId = that.getIdWithOutAgentId(data.upUserId);
                    var owner = data.userData.roomInfo.Creator == upUserId;
                    ChatroomAction.addMember(
                      that.createMember4Component(
                        owner ? "owner" : "guest",
                        upUserId,
                        "",
                        upUserId,
                        ""
                      )
                    );

                    if (!owner) {
                      ChatroomAction.setMemberStatus(upUserId, 1);
                    }

                    NetcallAction.addMember(
                      {
                        account: upUserId,
                        self: false,
                        streamObj: data.streamInfo.streamObj
                      },
                      false,
                      false
                    );

                    EXT_EVENTPOOL.handleRtcPermissionAndDraw(upUserId, undefined, data.streamInfo.streamObj);

                    break;
                  case "removeUploader":
                    var upUserId = that.getIdWithOutAgentId(data.upUserId);

                    EXT_ROOM.stopRemoteStream(upUserId);
                    NetcallAction.delMember(upUserId);
                    ChatroomAction.setMemberStatus(upUserId, 0);
                    // 画面取消

                    EXT_ROOM.stopAllRemoteStream();
                    EXT_ROOM.reDrawVideos();

                    break;
                  case "delChannel":

                    break;
                  case "createChannel":
                    if (data.status == "success") {
                      if (window.StarRtc.Instance.configModePulic) {
                        $.get(starRtc.workServerUrl + "/class/store?appid=" + NimState.agentId + "&ID=" + data.userData.roomInfo.ID + "&Name=" + data.userData.roomInfo.Name + "&Creator=" + data.userData.roomInfo.Creator);
                      }
                      else {
                        window.StarRtc.Instance.reportVideoClassRoom(data.userData.roomInfo, null);
                      }
                      thisRoom.createStream();
                    }
                    else {
                      reject("创建失败:" + data.msg);
                    }
                    break;
                  case "streamData":
                    var obj = JSON.parse(data.streamData);
                    EXT_WHITEBOARD.act({ account: obj.account, data: obj.data })
                    break;
                  case "serverErr":
                    alert("服务器错误：" + data.msg);
                    break;
                }
              }
              break;
            case "onChatRoomMessage":
              {
                switch (data.type) {
                  case "recvChatPrivateMsg":
                    that.doProcessPrivateMsg(data);

                    break;
                  case "recvChatMsg":
                    var msg = JSON.parse(data.msg.contentData);
                    that.onChatroomMsgs(msg);
                    break;
                  case "chatroomUserKicked":

                    break;
                  case "deleteChatRoom":

                    break;
                  case "serverErr":
                    alert("服务器错误：" + data.msg);
                    break;
                }
              }
              break;
          }
        },
        { "roomInfo": roomInfo }
      );
      currRoom.sigConnect();
    });

  },

  async joinRoom(roomInfo, userId) {
    const that = this;
    return new Promise((resolve, reject) => {
      var starRtc = NimState.nim;

      var currRoom = starRtc.getVideoLiveRoomSDK("vdn", "open",
        (data, status, oper) => {
          var thisRoom = data.obj;
          switch (status) {
            //链接状态
            case "connect success":
              switch (oper) {
                case "open":
                  thisRoom.createStream();
                  break;
                case "new":
                  break;
              }
              break;
            case "connect failed":
              reject("connect failed");
              break;
            case "connect closed":
              break;
            case "onWebrtcMessage":
              switch (data.type) {
                case "streamCreated":
                  if (data.status == "success") {
                    thisRoom.joinRoom();
                  }
                  else {
                    reject("获取摄像头视频失败！请检查摄像头设备是否接入！");
                  }
                  break;
                case "vdnApplyDownload":
                  if (data.status == "success") {
                    ChatroomAction.setChatroom(data.userData.roomInfo.ID, currRoom);
                    ChatroomAction.setCurrChatroomId(data.userData.roomInfo.ID);
                    NetcallAction.setRoom(currRoom);
                    resolve();
                  }
                  else {
                    reject("获取数据失败");
                    console.log("收到vdnApplyDownload_failed");
                    thisRoom.leaveRoom();
                  }
                  break;
                case "addUploader":

                  var upUserId = that.getIdWithOutAgentId(data.upUserId);
                  var owner = data.userData.roomInfo.Creator == upUserId;
                  ChatroomAction.addMember(
                    that.createMember4Component(
                      owner ? "owner" : "guest",
                      upUserId,
                      "",
                      upUserId,
                      ""
                    )
                  );

                  if (!owner) {
                    ChatroomAction.setMemberStatus(upUserId, 1);
                  }

                  NetcallAction.addMember(
                    {
                      account: upUserId,
                      self: false,
                      streamObj: data.streamInfo.streamObj
                    },
                    false,
                    false
                  );

                  EXT_EVENTPOOL.handleRtcPermissionAndDraw(upUserId, undefined, data.streamInfo.streamObj);
                  break;
                case "removeUploader":
                  var upUserId = that.getIdWithOutAgentId(data.upUserId);

                  EXT_ROOM.stopRemoteStream(upUserId);
                  NetcallAction.delMember(upUserId);
                  ChatroomAction.setMemberStatus(upUserId, 0);

                  EXT_ROOM.stopAllRemoteStream();
                  EXT_ROOM.reDrawVideos();

                  break;
                case "streamData":
                  var obj = JSON.parse(data.streamData);
                  EXT_WHITEBOARD.act({ account: obj.account, data: obj.data })
                  break;
                case "serverErr":
                  alert("服务器错误：" + data.msg);
                  break;
              }
              break;
            case "onChatRoomMessage":
              {
                switch (data.type) {
                  case "recvChatPrivateMsg":
                    that.doProcessPrivateMsg(data);

                    break;
                  case "recvChatMsg":
                    var msg = JSON.parse(data.msg.contentData);
                    that.onChatroomMsgs(msg);
                    break;
                  case "chatroomUserKicked":
                    thisRoom.leaveRoom();
                    alert("你已被踢出房间！");
                    break;
                  case "serverErr":
                    alert("服务器错误：" + data.msg);
                    break;
                }
              }
              break;
          }
        },
        { "roomInfo": roomInfo }
      );
      currRoom.sigConnect();
    });
  },

  logout() {
    //断开连接

    const room = NetcallState.room;
    room && room.leaveRoom() && room.sigDisconnect();

    NetcallAction.setRoom(null);
    NetcallAction.setWebRtc(null)
    NetcallAction.setVideo4ScreenShareing(false)
    NetcallAction.setScreenShareing4Local(false)
    NetcallAction.clearDoms()
    NetcallAction.setFromCreate(false)
    NetcallAction.setHasPermission(false)
    NetcallAction.setShowStatus(0)
    NetcallAction.clearMembers()
    NetcallAction.setVideo(true)
    NetcallAction.setAudio(true)
    //清理全局状态
    ChatroomAction.setChatroom("", null);
    ChatroomAction.setCurrChatroomId("");
    ChatroomAction.clearMsgs();
    ChatroomAction.clearMembers();
    ChatroomAction.setType("");
    ChatroomAction.setIsShowMemberTab(false);
    ChatroomAction.setLastTimestamp(0);
    ChatroomAction.setCanLoadHistory(true);
    ChatroomAction.setShowEmojiPanel(false);
    ChatroomAction.setHasPermissionRequest(false);

    EventPoolAction.clearRemoteTrackNotifications()

    EXT_WHITEBOARD.leaveChannel();
    EXT_WHITEBOARD.clearAll();

    //清空标记
    Storage.remove("roomId");
    Storage.remove("isTeacher");
    Storage.remove("joinFlag");

    Storage.remove('hasPermission')
    Storage.remove('teacherAccount')

    Page.to("home");
  },

  doLinkStop() {
    return new Promise((resolve, reject) => {
      var currRoom = ChatroomState.currChatroom;

      if (currRoom) {
        currRoom.leaveRoom();
        currRoom.sigDisconnect();

        const index = NetcallAction.findMember({
          account: NimState.account
        });

        this.stopLocalStream(NetcallState.doms[index]);

        NetcallAction.delMember(NimState.account);

        this.stopAllRemoteStream();
      }

      this.joinRoom(currRoom.getUserData().roomInfo, NimState.account)
        .then(() => {

          NetcallAction.setHasPermission(false);

          ChatroomAction.setMemberStatus(NimState.account, 0);

          // 白板本地行为
          EXT_WHITEBOARD.changeRoleToAudience();
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  },

  doProcessPrivateMsg(data) {
    console.log("doProcessPrivateMsg 处理chat私有消息");
    if (data.msg.msgType == "linkStop") {
      this.doLinkStop().then(() => {
        NetcallAction.setShowStatus(0);
        Alert.open({
          title: "提示",
          msg:
            '<div class="u-end-interaction"><i class="u-icon-tip"></i>你被老师取消互动</div>',
          isHtml: true,
          btns: [
            {
              label: "确定",
              clsName: "u-btn-smaller",
              onClick: () => {
                console.log("【老师剔除学生，学生提示弹窗】--> 确定");
                Alert.close();
              }
            }
          ],
          close: () => {
            console.log("【老师剔除学生，学生提示弹窗】--> x");
            Alert.close();
          }
        });
      });
    }
    else if (data.msg.msgType == "apply") {
      Alert.open({
        title: "提示",
        msg:
          '<div class="u-stop-interaction"><i class="u-icon-tip"></i>用户 ' + data.msg.fromId + ' 申请进行互动</div>',
        isHtml: true,
        btns: [
          {
            label: "同意",
            clsName: "u-btn-smaller f-mgr-10",
            onClick: () => {
              this.sendApplyAgreeMsg(data.msg.fromId);
              Alert.close();
            }
          },
          {
            label: "拒绝",
            clsName: "u-btn-cancle",
            onClick: () => {
              this.sendApplyDisagreeMsg(data.msg.fromId);
              Alert.close();
            }
          }
        ]
      });
    }
    else if (data.msg.msgType == "applyAgree" || data.msg.msgType == "inviteStart") {
      var currRoom = ChatroomState.currChatroom;

      if (currRoom) {
        currRoom.leaveRoom();
        currRoom.sigDisconnect();

        this.stopAllRemoteStream();

      }

      this.createRoom(currRoom.getUserData().roomInfo, "", true)
        .then(() => {

          NetcallAction.addMember(
            {
              account: NimState.account,
              self: true
            },
            false,
            false
          );

          NetcallAction.setHasPermission(true);
          // 白板本地行为
          EXT_WHITEBOARD.changeRoleToPlayer();
          EXT_WHITEBOARD.checkColor();

          const index = NetcallAction.findMember({
            account: NimState.account
          });
          if (index != -1) {
            this.startLocalStream(NetcallState.doms[index]);
          }

          ChatroomAction.setMemberStatus(NimState.account, 1);

        })
        .catch(err => {
          alert("fail");
        });
    }
  },

  createChatroomMsg4Component(
    _type,
    _account,
    _fromAvatar,
    _fromNick,
    _content,
    catalog
  ) {
    return {
      type: _type,
      account: _account,
      avatar: _fromAvatar,
      nick: _fromNick,
      content: _content,
      catalog: catalog
    };
  },

  createChatroomMsg4Format(
    _type,
    _from,
    _fromAvatar,
    _fromNick,
    _text
  ) {
    return {
      type: _type,
      from: _from,
      fromAvatar: _fromAvatar,
      fromNick: _fromNick,
      text: _text
    };
  },

  //聊天成员列表组件渲染对象
  createMember4Component(_type, _account, _avatar, _nick, _enterTime) {
    return {
      type: _type,
      account: _account,
      avatar: _avatar,
      nick: _nick,
      enterTime: _enterTime
    };
  },

  handleEmojiText(sourceText) {
    console.log("source text: ", sourceText);
    if (/\[[^\]]+\]/.test(sourceText)) {
      let emojiItems = sourceText.match(/\[[^\]]+\]/g);
      emojiItems.forEach(text => {
        let emojiCnt = emojiData.emojiList.emoji;
        if (emojiCnt[text]) {
          sourceText = sourceText.replace(
            text,
            `<img class="emoji" src="${
            emojiCnt[text].img
            }?imageView&thumbnail=28x28">`
          );
        }
      });
    }

    console.log("target text: ", sourceText);
    return sourceText;
  },

  //发送聊天室消息
  sendChatroomMsg(content) {
    const chatroom = ChatroomState.currChatroom;
    const that = this;
    return new Promise((resolve, reject) => {
      var msg = EXT_ROOM.createChatroomMsg4Format("text", NimState.account, null, NimState.account, content);
      chatroom.sendChatMsg(JSON.stringify(msg));
      that.onChatroomMsgs([msg]);
      resolve();
      //触发页面自动渲染
    });
  },

  //发送聊天室自定义消息(控制权限消息)
  sendCustomMsg(data) {
    const chatroom = ChatroomState.currChatroom;
    return new Promise((resolve, reject) => {
      chatroom.sendCustomMsg({
        content: JSON.stringify({
          type: 10,
          data: data
        }),
        done: function (error, msg) {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        }
      });
    });
  },

  sendStreamData(data) {
    const chatroom = ChatroomState.currChatroom;
    const that = this;
    return new Promise((resolve, reject) => {
      chatroom.sendStreamData(data);
      resolve();
      //触发页面自动渲染
    });
  },

  //发送聊天室猜拳消息
  sendCqMsg() {
    const chatroom = ChatroomState.currChatroom;
    const that = this;
    return new Promise((resolve, reject) => {

      var content = JSON.stringify({
        type: 1,
        data: {
          value: Math.ceil(Math.random() * 3)
        }
      });
      var msg = EXT_ROOM.createChatroomMsg4Format("custom", NimState.account, null, NimState.account, content);
      msg.content = content;
      chatroom.sendChatMsg(JSON.stringify(msg));
      that.onChatroomMsgs([msg]);
      resolve();
    });
  },

  sendPinupMsg(catalog, chartlet) {
    const chatroom = ChatroomState.currChatroom;
    const that = this;
    return new Promise((resolve, reject) => {

      var content = JSON.stringify({
        type: 3,
        data: {
          catalog: catalog,
          chartlet: chartlet
        }
      });

      var msg = EXT_ROOM.createChatroomMsg4Format("custom", NimState.account, null, NimState.account, content);
      msg.content = content;
      chatroom.sendChatMsg(JSON.stringify(msg));
      that.onChatroomMsgs([msg]);
      resolve();
    });
  },

  onChatroomMsgs(msgs) {
    console.log("onChatroomMsgs", msgs);

    if (!Array.isArray(msgs)) {
      msgs = [msgs];
    }

    msgs = msgs.map(msg => {
      return this.formatChatroomMsg(msg, false);
    });
    console.log("$$$$$$$ 收到消息:", msgs.length, msgs);

    //更新聊天消息列表
    ChatroomAction.setMsgs(msgs);

    //自动滚动到底部
    setTimeout(() => {
      const msgListEle = document.getElementById("chat-msg-list");
      //仅当在讨论TAB时进行自动滚动处理
      if (msgListEle) {
        msgListEle.scrollTop = msgListEle.scrollHeight;
      }
    }, 0);
  },

  //格式化处理聊天室消息
  formatChatroomMsg(msg, onlyFormatMsg) {
    switch (msg.type) {
      case "text":
        //表情字符转为图片
        let sourceText = msg.text;
        console.log("sourceText: ", sourceText);
        sourceText = Valid.escape(sourceText);
        console.log("escape: ", sourceText);

        sourceText = this.handleEmojiText(sourceText);

        return this.createChatroomMsg4Component(
          "text",
          msg.from,
          msg.fromAvatar,
          msg.fromNick,
          sourceText
        );
      case "notification":
        let attach = msg.attach;
        switch (attach.type) {
          //成员加入
          case "memberEnter":
            //额外业务处理
            if (!onlyFormatMsg) {
              this.getChatroomMembersInfo(msg.from)
                .then(memberInfo => {
                  console.log("memberEnter ->", memberInfo);
                  //成员变更调整当前列表
                  ChatroomAction.addMember(
                    this.createMember4Component(
                      memberInfo.members[0].type,
                      memberInfo.members[0].account,
                      memberInfo.members[0].avatar,
                      memberInfo.members[0].nick,
                      memberInfo.members[0].enterTime
                    )
                  );

                  // //自己加入则设置对应成员类型 (已在页面加载时设置，不重新处理)
                  // if (attach.from == NimState.account) {
                  //   ChatroomAction.setType(memberInfo.members[0].type);
                  // }
                })
                .catch(error => {
                  console.error("获取成员信息失败...", error);
                });

              //主持人发送点对点消息给成员
              const isTeacher = Number(Storage.get("isTeacher"));
              const account = Storage.get("account");
              const teacherAccount = Storage.get("teacherAccount");
              //创建房间不进行请求
              if (NetcallState.fromCreate) {
                NetcallAction.setFromCreate(false);
                console.log(
                  "设置[创建房间]的标记为false，老师首次创建房间不发起请求权限人员消息..."
                );
                return this.createChatroomMsg4Component(
                  "notification",
                  msg.from,
                  "",
                  "",
                  attach.from == NimState.account
                    ? "欢迎你进入房间"
                    : attach.from + "进入了房间"
                );
              }

              if (msg.from == teacherAccount) {
                //老师重新上线
                console.log("===老师重新上线--->");
                if (isTeacher == 1) {
                  NetcallAction.addMember(
                    {
                      account: msg.from,
                      self: true
                    },
                    true,
                    false
                  );

                } else {
                  NetcallAction.addMember(
                    {
                      account: msg.from,
                      self: false
                    },
                    true,
                    false
                  );
                }

                EXT_ROOM.reDrawVideos();
              }

              //老师端学生上线
              if (isTeacher == 1 && msg.from != account) {
                console.log("### 老师端有学生上线...");
                let uids = [];
                NetcallState.members.forEach(item => {
                  if (item.account && item.account != "") {
                    uids.push(item.account);
                  }
                });
                console.log("uids: ", uids);

                //通知有权限成员列表给上线学生【点对点】

              } else if (msg.from == account) {
                //老师/学生重新上线
                console.log(
                  (msg.from == teacherAccount ? "老师" : "学生") +
                  "上线，向所有人发送请求有权限的成员消息(2s后）进行"
                );
                setTimeout(() => {
                  if (NimState.hasReceiveHostMsg) {
                    NimAction.setHasReceiveHostMsg(false);
                    console.log(
                      "#### 已收到主持人的有权限成员列表通知消息，不进行收集权限过程"
                    );
                    return;
                  }

                  console.log("*** 开始权限收集");
                  this.sendCustomMsg({
                    room_id: ChatroomState.currChatroomId,
                    command: 2
                  })
                    .then(() => {
                      console.log("请求有权限成员的聊天室消息成功");
                    })
                    .catch(error => {
                      console.error("请求有权限成员的聊天室消息失败", error);
                    });
                }, 2000);
              }
            }
            return this.createChatroomMsg4Component(
              "notification",
              msg.from,
              "",
              "",
              attach.from == NimState.account
                ? "欢迎你进入房间"
                : attach.from + "进入了房间"
            );

          //成员离开
          case "memberExit":
            if (!onlyFormatMsg) {
              //成员变更调整当前列表
              ChatroomAction.delMember(msg.from);
            }
            return this.createChatroomMsg4Component(
              "notification",
              msg.from,
              "",
              "",
              attach.from + "离开了房间"
            );

          //聊天室更新(屏幕共享状态通知)
          case "updateChatroom":
            if (!onlyFormatMsg) {
              console.log("#### updateChatroom: ", attach.custom);
              let custom = null;
              try {
                custom = JSON.parse(attach.custom);
              } catch (e) { }
              if (custom == null) {
                console.error("解析custom失败");
                return;
              }

              console.log("custom: ", custom);

              //设置远端是否正在屏幕共享
              NetcallAction.setVideo4ScreenShareing(custom.fullScreenType == 1);

              //关闭后处理（重新设置对应老师的画面节点）
              if (custom.fullScreenType == 0) {
                console.log(" 重新设置对应老师画面...");
                NetcallAction.setScreenShareing4Local(false);
                const teacherAccount = Storage.get("teacherAccount");

                //默认窗口显示
                const index = NetcallAction.findMember({
                  account: teacherAccount
                });
                console.log(
                  "### 缩小",
                  index,
                  NetcallState.doms[index],
                  teacherAccount
                );

              } else {
                if (Storage.get("isTeacher") == 0) {
                  // 非教师下收到屏幕共享通知需重置标记
                  NetcallAction.setScreenShareing4Local(false);
                }
              }
            }
            break;
        }
        break;
      case "custom":
        console.log("==== 聊天室自定义: ", msg);
        let content = null;
        try {
          content = JSON.parse(msg.content);
        } catch (e) {
          console.error("解析聊天室自定义消息内容失败", e);
          content = null;
        }
        if (!content) {
          console.error("###聊天室自定义消息无内容");
          return;
        }

        const type = content.type;

        //猜拳消息
        if (type == 1) {
          const value = content.data.value;
          const resourceUrl = env.resourceUrl;
          console.log(env);
          console.log("猜拳消息内容: ", value, resourceUrl);
          return this.createChatroomMsg4Component(
            "caiquan",
            msg.from,
            msg.fromAvatar,
            msg.fromNick,
            `${resourceUrl}/im/play-${value}.png`
          );
        } else if (type == 3) {
          //贴图 消息
          const catalog = content.data.catalog;
          const chartlet = content.data.chartlet;
          const emojiBaseUrl = env.emojiBaseUrl;
          const url =
            `${emojiBaseUrl}/${catalog}/${chartlet}.png?imageView&thumbnail=` +
            (catalog == "emoji" ? "28x28" : "48x48");

          return this.createChatroomMsg4Component(
            "emoji",
            msg.from,
            msg.fromAvatar,
            msg.fromNick,
            url,
            catalog
          );
        } else if (type == 10) {
          if (!onlyFormatMsg) {
            //收到聊天室权限控制消息
            const command = content.data.command;
            //收到请求有权限成员的聊天室消息【成员】
            if (command == 2) {
              //发送点对点自己有权限的通知(自己有权限时下发)
              if (NetcallState.hasPermission) {
              }
            } else if (command == 1) {
              //收到主持人通知有权限成员列表的聊天室消息【成员】，非主持人发送的直接忽略
              console.log("**** 主持人通知有权限成员列表的聊天室消息");
              const teacherAccount = Storage.get("teacherAccount");
              if (teacherAccount != msg.from) {
                console.error("非主持人发送的权限广播消息，直接忽略 ");
                return this.createChatroomMsg4Component(
                  "custom",
                  msg.from,
                  "",
                  "",
                  "聊天室自定义消息忽略不显示"
                );
                return;
              }

              const uids = content.data.uids;
              let members = [];
              let owner = ""; //教师帐号
              ChatroomState.members.forEach(item => {
                if (item && item.type === "owner") {
                  owner = item.account;
                }
              });
              uids.forEach(item => {
                if (item && item != "") {
                  if (owner === item) {
                    members.unshift({
                      account: item,
                      self: item == NimState.account
                    });
                  } else {
                    members.push({
                      account: item,
                      self: item == NimState.account
                    });
                  }

                  //互动成员则标记一下
                  const isTeacher = Number(Storage.get("isTeacher"));
                  if (isTeacher == 0) {
                    //聊天室成员互动状态标记
                    ChatroomAction.setMemberStatus(item, 1);
                  }
                }
              });

              //重置不再互动的成员状态
              ChatroomState.members.forEach(item => {
                let interactionUser = false;
                uids.forEach(item2 => {
                  if (item.account == item2) {
                    interactionUser = true;
                  }
                });
                if (!interactionUser) {
                  console.log("已不再互动的成员状态重置:", item.account);
                  ChatroomAction.setMemberStatus(item.account, 0);
                }
              });

              //处理已有互动成员在firefox 上结束互动后对应流未移除导致的黑屏问题
              let notmembers = [];
              let preventMembers = NetcallState.members;
              preventMembers.forEach((item, index) => {
                let findIdx = members.findIndex(newitem => {
                  return newitem.account == item.account;
                });
                if (findIdx == -1) {
                  notmembers.push({
                    account: item.account,
                    index: index
                  });
                }
              });

              console.log('###### 已不再netcall互动列表的人员及对应位置为：', notmembers);

              //如果有找到不再互动的原有节点则进行删除
              notmembers.forEach(item => {
                const currentDom = NetcallState.doms[item.index];
                if (currentDom) {
                  let ele4Video = currentDom.getElementsByTagName('div');
                  if (ele4Video.length > 0) {
                    ele4Video = ele4Video[0];
                    console.log('**** 清理不再互动的画面节点：', ele4Video);
                    currentDom.removeChild(ele4Video);
                  }
                }
              });

              //设置最新的RTC成员
              NetcallAction.setMembers(members);
              EXT_ROOM.reDrawVideos();
            }
          }
        } else {
          //ignore非权限控制的自定义消息
          console.log("忽略聊天室自定义消息type: ", type);
        }

        return this.createChatroomMsg4Component(
          "custom",
          msg.from,
          "",
          "",
          "聊天室自定义消息忽略不显示"
        );
        break;
    }

    //不处理的消息直接显示默认表现
    return this.createChatroomMsg4Component(
      "custom",
      msg.from,
      "",
      "",
      "聊天室自定义消息忽略不显示"
    );
  },

  //重新渲染画面
  reDrawVideos() {
    NetcallState.members.forEach((item, index) => {
      const account = item.account
      if (account == '') {
        console.log('ignore Unknown account', index)
        return
      }
      //自已
      if (account == NimState.account) {
        console.log('重新渲染自己本地画面', account)
        EXT_ROOM.startLocalStream(NetcallState.doms[index])
      } else {
        //他人
        console.log('重新渲染远程画面', account)
        EXT_EVENTPOOL.handleRtcPermissionAndDraw(account, index, item.streamObj)
      }
    })
  },

  createVideoDomNode(node, uid) {
    var t = document.createElement("div");
    t.style.overflow = "hidden",
      t.style.position = "relative",
      t.style.width = "184px",
      t.style.height = "137px",
      t.style.display = "none";
    var n = document.createElement("video");
    n.setAttribute("x-webkit-airplay", "x-webkit-airplay"),
      n.setAttribute("playsinline", "playsinline"),
      n.setAttribute("webkit-playsinline", "webkit-playsinline"),
      n.preload = "auto",
      n.dataset.uid = uid,
      n.autoplay = "autoplay",
      n.style.position = "absolute",
      n.style.left = "50%",
      n.style.top = "50%",
      n.style.transform = "translate(-50%,-50%)",
      n.style.width = "184px",
      n.style.height = "137px",
      t.appendChild(n),
      setTimeout(function () {
        t.style.display = "inline-block"
      }, 1e3),
      t.style.color = "#fff";
    var r = document.createElement("p");
    r.textContent = uid,
      r.zIndex = 1,
      t.appendChild(r);
    node.appendChild(t);
    return n;
  },

  //预览远程视频流
  startRemoteStream(account, node, streamObj) {
    if(node === undefined) return;
    var vNode = this.createVideoDomNode(node, "");
    vNode.srcObject = streamObj;
  },

  //停止预览远程视频流
  stopAllRemoteStream() {
    NetcallState.doms.forEach(item => {
      item.innerHTML = "";
    });
  },

  //停止预览远程视频流
  stopRemoteStream(account) {

    const index = NetcallAction.findMember({
      account: account
    });
    if (index != -1) {
      NetcallState.doms[index].innerHTML = "";
    }
  },

  //预览本地摄像头
  startLocalStream(node) {
    var vNode = this.createVideoDomNode(node, "");
    NetcallState.room.startLocalStream(vNode)
  },

  //停止预览本地摄像头
  stopLocalStream(node) {
    node.innerHTML = "";
  },

  sendApplyMsg() {
    const chatroom = ChatroomState.currChatroom;
    return new Promise((resolve, reject) => {
      chatroom.sendApplyMsg();
      resolve();
      //触发页面自动渲染
    });
  },

  sendApplyDisagreeMsg(userId) {
    const chatroom = ChatroomState.currChatroom;
    return new Promise((resolve, reject) => {
      chatroom.sendApplyDisagreeMsg(userId);
      resolve();
      //触发页面自动渲染
    });
  },

  sendApplyAgreeMsg(userId) {
    const chatroom = ChatroomState.currChatroom;
    return new Promise((resolve, reject) => {
      chatroom.sendApplyAgreeMsg(userId);
      resolve();
      //触发页面自动渲染
    });
  },

  sendLinkStopMsg(userId) {
    const chatroom = ChatroomState.currChatroom;
    return new Promise((resolve, reject) => {
      chatroom.sendLinkStopMsg(userId);
      resolve();
      //触发页面自动渲染
    });
  },

  getIdWithOutAgentId(userId) {
    const index = userId.indexOf("_");
    if (index != -1) {
      return userId.substring(index + 1);
    }
    else {
      return userId;
    }
  }
};
