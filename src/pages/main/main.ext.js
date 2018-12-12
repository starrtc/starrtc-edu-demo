/*

 * 扩展脚本
 */

import { Page, Storage } from "util";

import EXT_NIM from "ext/nim";
import EXT_CHAT from "ext/chatroom";
import EXT_NETCALL from "ext/webrtc";
import EXT_WHITEBOARD from "ext/whiteboard";

import { StoreNim, StoreChatroom, StoreNetcall, StoreWhiteBoard } from "store";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

export default {
  autoLogin() {
    //检测当前机器的可用设备
    console.log("检测当前机器的可用设备....");
    WebRTC.checkCompatibility()
      .then(data => {
        let hasCamera = data.Camera;
        let hasMicrophone = data.Microphone;
        console.log("--- 设备状态", data);

        //设置当前用户的麦克风与摄像头的状态
        NetcallAction.setHasAudio(hasMicrophone);
        NetcallAction.setHasVideo(hasCamera);
      })
      .catch(error => {
        console.error("获取当前机器可用设备时异常: ", error);
        NetcallAction.setHasAudio(false);
        NetcallAction.setHasVideo(false);
      });
    // 初始化屏幕共享状态
    NetcallAction.settabindex(0)
    NetcallAction.setShareStarted(false)
    if (NimState.account) {
      this.autoLoginChatroom();
      return;
    }

    console.log("main:开始自动登录nim过程...");

    const account = Storage.get("account");
    const token = Storage.get("token");

    if (!account || !token) {
      console.error("main:自动登录nim:缺少account或token");
      Page.to("login");
      return;
    }

    //步骤1：NIM登录
    EXT_NIM.login(account, token)
      .then(() => {
        console.log("main:自动登录nim成功");

        //继续登录聊天室
        this.autoLoginChatroom();
      })
      .catch(error => {
        console.error("main:自动登录nim失败");

        Page.to("login", error);
      });
  },

  autoLoginChatroom() {
    if (ChatroomState.currChatroom) {
      console.log("main:已登录，自动切换到main");
      this.doRtcAndWB();
      return;
    }
    console.log("main:开始自动登录chatroom过程...");

    //步骤2：聊天室登录
    const roomId = Storage.get("roomId");
    if (!roomId) {
      console.error("main:自动登录chatroom失败：缺少roomid，回到home");
      Page.to("home");
      return;
    }

    EXT_CHAT.login(roomId)
      .then(() => {
        console.log("main:自动登录chatroom成功");
        this.doRtcAndWB();
      })
      .catch(error => {
        console.error("main:自动登录chatroom失败", error);

        Page.to("home");
      });
  },

  doRtcAndWB() {
    //初始化RTC房间节点
    NetcallAction.addDom(document.getElementById("video-1"));
    NetcallAction.addDom(document.getElementById("video-2"));
    NetcallAction.addDom(document.getElementById("video-3"));
    NetcallAction.addDom(document.getElementById("video-4"));

    //继续webrtc登录
    this.autoLoginWebRtc();
    //继续白板登录
    this.autoLoginWhiteBoard();
  },

  autoLoginWebRtc() {
    //未实例化WEBRTC实例，则先初始化
    if (!NetcallState.webrtc) {
      EXT_NETCALL.initSDK();
    }

    //解决老师重新登录后的状态问题
    EXT_CHAT.getChatroomMembersInfo(NimState.account)
      .then(memberInfo => {
        console.log("自动登录RTC前，预加载当前用户的角色：", memberInfo);
        ChatroomAction.setType(memberInfo.members[0].type);

        const isTeacher = memberInfo.members[0].type == "owner";
        this.joinChannelRtc(ChatroomState.currChatroomId, isTeacher);
      })
      .catch(error => {
        console.error("获取成员信息失败...", error);
      });
  },
  // 加入RTC房间
  joinChannelRtc(roomId, isTeacher) {
    console.log("===  开始加入RTC房间");
    EXT_NETCALL.joinChannel(ChatroomState.currChatroomId)
      .then(obj => {
        console.log("webrtc 加入房间成功", obj);

        isTeacher == 1 ? this.doRtcTask4Teacher() : this.doRtcTask4Student();
      })
      .catch(error => {
        if (
          error &&
          error.event &&
          error.event.code &&
          error.event.code == 404
        ) {
          //创建房间
          if (isTeacher == 1) {
            console.log("老师端，RTC房间不存在，主动创建...");
            this.createChannelRtc(ChatroomState.currChatroomId);
          } else {
            console.error("webrtc 房间不存在", error);
          }
        } else {
          console.error("webrtc 加入房间失败: ", error);

          // TODO 此处存在强耦合，需要重构
          if (error == "已经加入房间") {
            isTeacher == 1
              ? this.doRtcTask4Teacher()
              : this.doRtcTask4Student();
          }
        }
      });
  },

  autoLoginWhiteBoard() {
    //未实例化WHITEBOARD实例，则先初始化
    if (!StoreWhiteBoard.whiteboard) {
      EXT_WHITEBOARD.initSDK();
    }

    const isTeacher = Number(Storage.get("isTeacher"));

    this.joinChannelWb(ChatroomState.currChatroomId, isTeacher);
  },
  // 加入白板房间
  joinChannelWb(roomId, isTeacher) {
    EXT_WHITEBOARD.joinChannel(ChatroomState.currChatroomId)
      .then(obj => {
        console.log("whiteboard 加入房间成功", obj);
        isTeacher == 1 ? this.doWbTask4Teacher() : this.doWbTask4Student();
      })
      .catch(error => {
        if (
          error &&
          error.event &&
          error.event.code &&
          error.event.code == 404
        ) {
          //创建房间
          if (isTeacher == 1) {
            console.log("老师端，WHITEBOARD房间不存在，主动创建...");
            this.createChannelWb(ChatroomState.currChatroomId);
          } else {
            console.error("whiteboard 房间不存在", error);
          }
        } else {
          console.error("whiteboard 加入房间失败: ", error);

          // TODO 此处存在强耦合，需要重构
          if (error == "已经加入房间") {
            isTeacher == 1 ? this.doWbTask4Teacher() : this.doWbTask4Student();
          }
        }
      });
  },
  //老师RTC房间行为
  doRtcTask4Teacher() {
    console.log("老师处理RTC...");
    //添加当前成员
    NetcallAction.addMember(
      {
        account: NimState.account,
        self: true
      },
      true,
      false
    );

    NetcallAction.setHasPermission(true);

    //一系列流程（麦克风、摄像头，开启连接）
    if (NetcallState.hasAudio && NetcallState.audio) {
      EXT_NETCALL.startMicro()
        .then(() => {
          console.log("===麦克风启动成功");
        })
        .catch(error => {
          console.error("===麦克风启动失败", error);

          //禁用状态识别
          //chrome
          if (error == "NotAllowedError") {
            NetcallAction.setHasAudio(false);
          }
        });
    }

    if (NetcallState.hasVideo && NetcallState.video) {
      EXT_NETCALL.startCamera()
        .then(() => {
          console.log("===摄像头启动成功");
          const dom = NetcallState.doms[0];
          console.log("当前人员加入节点：", dom);

          EXT_NETCALL.startLocalStream(dom);
          EXT_NETCALL.setVideoViewSize();
        })
        .catch(error => {
          console.error("===摄像头启动失败", error);

          //禁用状态识别
          //chrome
          if (error == "NotAllowedError") {
            NetcallAction.setHasVideo(false);
          }
        });
    }

    EXT_NETCALL.changeRoleToPlayer();
    EXT_NETCALL.startRtc();
  },
  //学生RTC房间行为
  doRtcTask4Student() {
    console.log("学生处理RTC...");
    EXT_NETCALL.changeRoleToAudience();
    EXT_NETCALL.startRtc();
  },
  //老师白板房间行为
  doWbTask4Teacher() {
    EXT_WHITEBOARD.changeRoleToPlayer();
    // 根据角色设置默认画笔颜色
    EXT_WHITEBOARD.setColor("#000");
  },
  // 学生白板房间行为
  doWbTask4Student() {
    EXT_WHITEBOARD.changeRoleToAudience();
    // 根据角色设置默认画笔颜色
    EXT_WHITEBOARD.setColor("#35CBFF");
  },
  createChannelRtc(roomId) {
    EXT_NETCALL.createChannel(roomId)
      .then(obj => {
        console.log("webrtc 创建房间成功");
        //创建成员后主动加入（老师）
        NetcallAction.setFromCreate(true);
        this.joinChannelRtc(roomId, true);
      })
      .catch(error => {
        console.error("webrtc 创建房间失败", error);
      });
  },
  createChannelWb(roomId) {
    EXT_WHITEBOARD.createChannel(roomId)
      .then(obj => {
        console.log("whiteboard 创建房间成功");
        //创建成员后主动加入（老师）
        this.joinChannelWb(roomId, true);
      })
      .catch(error => {
        console.error("whiteboard 创建房间失败");
      });
  }
};
