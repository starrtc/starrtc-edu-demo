/*

 * 登录进来的首页，创建房间、加入房间的页面
 * 注：
 */
import React, { Component } from "react";
import { observer } from "mobx-react";

import { Row, Col, Button } from "../../component";
import { Page, Storage, Alert, CheckBroswer } from "../../util";
import { Whiteboard, Chatroom } from "../../module";
import Video from "../../module/netcall/video";

import EXT_NIM from '../../ext/nim'
import EXT_WHITEBOARD from "../../ext/whiteboard";
import EXT_ROOM from '../../ext/room'

import Header from "../../component/layout/header";

import { StoreNim, StoreChatroom, StoreNetcall, StoreWhiteBoard } from "../../store";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

@observer
class Main extends Component {
  state = {
    needShowTip: true, //是否需要持续显示设备无可用的提示消息
    requesting: false //是否正在请求
  };
  componentDidMount() {
    CheckBroswer({
      success: this.init.bind(this)
    });
  }

  init() {
    NetcallAction.setShowStatus(0);
    this.autoLogin();
  }
  
  autoLogin = () => {
    //检测当前机器的可用设备
    console.log("检测当前机器的可用设备....");
	NetcallAction.setHasAudio(true);
    NetcallAction.setHasVideo(true);
   
    // 初始化屏幕共享状态
    NetcallAction.settabindex(0);
    NetcallAction.setShareStarted(false);
    if (NimState.nim) {
      this.autoLoginChatroom();
      return;
    }

    console.log("main:开始自动登录nim过程...");

    const account = Storage.get("account");
    const token = Storage.get("token");
	const authKey = Storage.get('authKey');
    if (!account || !token) {
      console.error("main:自动登录nim:缺少account或token");
      Page.to("login");
      return;
    }

	EXT_NIM.login(account, token)
	.then((key) =>{
		console.log("main:自动登录nim成功");
		Storage.set('account', account);
		Storage.set('token', token);
		Storage.set('authKey', authKey);
        //继续登录聊天室
        this.autoLoginChatroom();
	})
	.catch(err =>
	{
		console.error("main:自动登录nim失败");

        Page.to("login", err);
	});
  };

  autoLoginChatroom = () => {
    if (ChatroomState.currChatroom) {
      console.log("main:已登录，自动切换到main");
      this.doRtcAndWB();
      return;
    }
    console.log("main:开始自动登录chatroom过程...");
	Page.to("home");
	
  }

  doRtcAndWB = () => {
    //初始化RTC房间节点
    NetcallAction.addDom(document.getElementById("video-1"));
    NetcallAction.addDom(document.getElementById("video-2"));
    NetcallAction.addDom(document.getElementById("video-3"));
    NetcallAction.addDom(document.getElementById("video-4"));

    //继续webrtc登录
    this.autoLoginWebRtc();
    //继续白板登录
    this.autoLoginWhiteBoard();
  };

  autoLoginWebRtc = () => {
    //未实例化WEBRTC实例，则先初始化
   
    //解决老师重新登录后的状态问题
   
		var type = NimState.nim.getInfo().userId == NetcallState.room.getUserData().roomInfo.Creator ? "owner" : "other";
        ChatroomAction.setType(type);

        const isTeacher = type == "owner";
        this.joinChannelRtc(ChatroomState.currChatroomId, isTeacher);
    
  };
  // 加入RTC房间
  joinChannelRtc = (roomId, isTeacher) => {
    console.log("===  开始加入RTC房间");
    

        isTeacher == 1 ? this.doRtcTask4Teacher() : this.doRtcTask4Student();
     
  };

  autoLoginWhiteBoard = () => {
    //未实例化WHITEBOARD实例，则先初始化
    if (!StoreWhiteBoard.whiteboard) {
      EXT_WHITEBOARD.initSDK();
    }

    const isTeacher = Number(Storage.get("isTeacher"));

    this.joinChannelWb(ChatroomState.currChatroomId, isTeacher);
  };
  // 加入白板房间
  joinChannelWb = (roomId, isTeacher) => {
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
  };
  //老师RTC房间行为
  doRtcTask4Teacher = () => {
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
     
    }

    if (NetcallState.hasVideo && NetcallState.video) {
		
		console.log("===摄像头启动成功");
		const dom = NetcallState.doms[0];
		console.log("当前人员加入节点：", dom);

		EXT_ROOM.startLocalStream(dom);
		
     
    }


  };
  //学生RTC房间行为
  doRtcTask4Student = () => {
    console.log("学生处理RTC...");
   
  };
  //老师白板房间行为
  doWbTask4Teacher = () => {
    EXT_WHITEBOARD.changeRoleToPlayer();
    // 根据角色设置默认画笔颜色
    EXT_WHITEBOARD.setColor("#000");
  };
  // 学生白板房间行为
  doWbTask4Student = () => {
    EXT_WHITEBOARD.changeRoleToAudience();
    // 根据角色设置默认画笔颜色
    EXT_WHITEBOARD.setColor("#35CBFF");
  };
  
  createChannelWb = (roomId) => {
    EXT_WHITEBOARD.createChannel(roomId)
      .then(obj => {
        console.log("whiteboard 创建房间成功");
        //创建成员后主动加入（老师）
        this.joinChannelWb(roomId, true);
      })
      .catch(error => {
        console.error("whiteboard 创建房间失败");
      });
  };

  request = e => {
		this.setState({
		  requesting: true
		});
		
		EXT_ROOM.sendApplyMsg()
		.then(() => {
			 //变成请求状态
			NetcallAction.setShowStatus(1);
			this.setState({
			  requesting: false
			});
		})
		.catch(err => {
			console.error("发送请求取消连麦消息失败", err);

			NetcallAction.setShowStatus(0);
			this.setState({
			  requesting: false
			});
		});
		
  };

  cancleRequest = e => {
		NetcallAction.setShowStatus(0);
        this.setState({
          requesting: false
        });
  };

  doStopInteraction = () => {
    console.log("【停止互动确认弹窗】--> 确定...");
    Alert.close();
	
	EXT_ROOM.doLinkStop().then(() => {
		 //变成请求状态
        NetcallAction.setShowStatus(0);

        this.setState({
          requesting: false
        });
	});
  };
  doCancle = () => {
    console.log("【停止互动确认弹窗】--> 取消...");
    Alert.close();
  };

  stopInteraction = e => {
    Alert.open({
      title: "提示",
      msg:
        '<div class="u-stop-interaction"><i class="u-icon-tip"></i>确定退出互动嘛？</div>',
      isHtml: true,
      btns: [
        {
          label: "确定",
          clsName: "u-btn-smaller f-mgr-10",
          onClick: () => {
            this.doStopInteraction();
          }
        },
        {
          label: "取消",
          clsName: "u-btn-cancle",
          onClick: () => {
            this.doCancle();
          }
        }
      ]
    });
  };

  findOwnerIdx() {
    
  }

  closeDeviceDisabledTip = () => {
    this.setState({
      needShowTip: false
    });
  };

  render() {
    const state = this.state;
    return (
      <div>
        <Header isHome={false} />
        <div className="m-main">
          <div className="room-info">
            房间号: {ChatroomState.currChatroomId}
          </div>
          <div className="more-opt">
            {ChatroomState.type != "owner" &&
              !NetcallState.hasPermission &&
              NetcallState.showStatus == 0 && (
                <Button
                  className="u-btn-longer"
                  onClick={this.request}
                  disabled={state.requesting}
                  loading={state.requesting}
                >
                  请求互动
                </Button>
              )}

            {ChatroomState.type != "owner" &&
              !NetcallState.hasPermission &&
              NetcallState.showStatus == 1 && (
                <Button
                  className="u-btn-longer"
                  onClick={this.cancleRequest}
                  disabled={state.requesting}
                  loading={state.requesting}
                >
                  取消互动
                </Button>
              )}

            {ChatroomState.type != "owner" &&
              NetcallState.hasPermission && (
                <Button
                  className="u-btn-longer u-btn-stop"
                  onClick={this.stopInteraction}
                  disabled={state.requesting}
                  loading={state.requesting}
                >
                  停止互动
                </Button>
              )}

            {ChatroomState.type != "owner" &&
              !NetcallState.hasPermission && (
                <div className="tip">
                  （注：加入互动后可在白板上与老师画图交流）
                </div>
              )}
          </div>
          <Whiteboard />
          <div className="m-netcall">
            {NetcallState.members.map((item, index) => (
              <Video
                key={index}
                className={"video-" + (index + 1)}
                index={index}
                self={item.self}
                account={item.account}
                offline={item.offline}
              />
            ))}
          </div>
          <Chatroom />
        </div>
      </div>
    );
  }
}

export default Main;
