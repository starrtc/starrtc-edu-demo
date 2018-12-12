/*

 * IM状态保持
 */

import { observable, computed, action, configure } from 'mobx';

import { Logger, Valid } from '../../util';

configure({ enforceActions : 'always' });

console.log('Storage', Storage);
console.log('Logger', Logger);
export default class {
  @observable
  state = {
    room: null, //room SDK实例
    video4ScreenSharing: false, //远端是否在屏幕共享状态标记
    screenShareing4Local: false, //本端是否大屏显示老师屏幕共享画面
    doms: [], //RTC dom
    fromCreate: false, //默认非创建
    hasPermission: false, //是否有互动
    showStatus: 0, //0请求互动，1取消互动
    webrtc: null, //WebRtc SDK实例
    members: [
      {
        account: "",
        self: false,
        offline: true //仅老师独有，进行默认画面图片替换
      },
      {
        account: "",
        self: false
      },
      {
        account: "",
        self: false
      },
      {
        account: "",
        self: false
      }
    ], //音视频成员(预定义四个)
    video: true, //当前成员视频启用状态
    audio: true, //当前成员音频启用状态
    hasVideo: false,//当前成员是否有可用摄像头
    hasAudio: false,//当前成员是否有可用麦克风
    setHasShareScreen: false, //当前用户是否点击过屏幕共享
    tabIndex: 0,
    shareStarted: false, // 是否已经屏幕共享
    chromeDown: false // 是否安装了chrome屏幕共享插件
  };

  @action
  setRoom(room) {
    this.state.room = room;
    console.log('store --> room --> setRoom');
  }
  
  
  
  @action
  setShareStarted(shareStarted){
    this.state.shareStarted = shareStarted;
    console.log('store --> chatroom --> setShareStarted', shareStarted);
  }
  @action
  setChromeDown(chromeDown){
    this.state.chromeDown = chromeDown;
    console.log('store --> chatroom --> setChromeDown', chromeDown);
  }

  @action
  settabindex(tabIndex) {
    this.state.tabIndex = tabIndex
    console.log('store --> netcall --> settabIndex', tabIndex)
  }

  @action
  setHasVideo(hasVideo){
    this.state.hasVideo=hasVideo;
    console.log('store --> netcall --> setHasVideo', hasVideo);
  }

  @action
  setHasAudio(hasAudio){
    this.state.hasAudio=hasAudio;
    console.log('store --> netcall --> setHasAudio', hasAudio);
  }

  @action
  setHasShareScreen(hasShareScreen){
    this.state.hasShareScreen=hasShareScreen;
    console.log('store --> netcall --> sethasShareScreen', hasShareScreen);
  }

  @action
  setVideo4ScreenShareing(video4ScreenSharing) {
    this.state.video4ScreenSharing = video4ScreenSharing;
    console.log(
      "store --> netcall --> setVideo4ScreenShareing",
      video4ScreenSharing
    );
  }

  
  @action
  setScreenShareing4Local(screenShareing4Local) {
    this.state.screenShareing4Local = screenShareing4Local;
    console.log("store --> netcall --> setScreenShareing4Local", screenShareing4Local);
  }
  /**
   * RTC房间人员列表重新排序（将离开成员置后处理）
   */
  @action
  resortMembers() {
    const tmp = this.state.members;
    //重新调整成员顺序（将留空位置置后处理）
    let newMembers = [];
    tmp.forEach(item => {
      if (item.account != "") {
        newMembers.push(item);
      }
    });

    //未满4人则置空成员
    this.addMemberIfNotFull(newMembers);

    this.state.members = newMembers;
    console.log("store --> netcall --> resortMembers", newMembers);
  }

  @action
  setFromCreate(fromCreate) {
    this.state.fromCreate = fromCreate;
    console.log("store --> netcall --> setFromCreate", fromCreate);
  }
  @action
  setShowStatus(showStatus) {
    this.state.showStatus = showStatus;
    console.log("store --> netcall --> setShowStatus", showStatus);
  }

  @action
  setDoms(doms) {
    this.state.doms = doms;
    console.log("store --> netcall --> setDoms", doms);
  }

  @action
  clearDoms() {
    this.state.doms = [];
    console.log("store --> netcall --> clearDoms");
  }

  @action
  addDom(dom) {
    //忽略重复的对象追加
    const addDomId = dom && dom.id ? dom.id:'';
    if(!addDomId){
      console.error('不存在的DOM节点或id属性：', addDomId);
      return;
    }
    const existIdx  = this.state.doms.findIndex((item, index)=>{
      if(item.id && item.id == addDomId){
        return index;
      }
    });
    if(existIdx!=-1){
      console.error('已存在对应的DOM节点，不重复追加...', existIdx);
      return;
    }
    this.state.doms.push(dom);
    console.log("store --> netcall --> addDom", dom);
  }

  @action
  setWebRtc(webrtc) {
    this.state.webrtc = webrtc;
    console.log("store --> netcall --> setWebRtc", webrtc);
  }

  @action
  setHasPermission(hasPermission) {
    this.state.hasPermission = hasPermission;
    console.log("store --> netcall --> setHasPermission", hasPermission);
  }

  findMember(member) {
    return this.state.members.findIndex((item, idx) => {
      return item.account == member.account;
    });
  }

  @action
  clearMembers() {
    this.state.members = [
      {
        account: "",
        self: false
      },
      {
        account: "",
        self: false
      },
      {
        account: "",
        self: false
      },
      {
        account: "",
        self: false
      }
    ];
    console.log("store --> netcall --> clearMembers");
  }

  @action
  setMembers(members) {
    if (!members) {
      return;
    }

    //未满4人则被空成员
    this.addMemberIfNotFull(members);

    this.state.members = members;
    console.log("store --> netcall --> setMembers", members);
  }

  addMemberIfNotFull(members) {
    const needAddLen = members.length < 4 ? 4 - members.length : 0;
    if (needAddLen > 0) {
      for (let i = 0, len = needAddLen; i < len; i++) {
        members.push({
          account: "",
          self: false
        });
      }
    }
  }

  /**
   * 是否可继续加人互动
   */
  canAddNewMember(){
    let existMemberCount = 0;
    this.state.members.forEach(item=>{
      if(item.account && item.account!=''){
        existMemberCount +=1;
      }
    });
    console.log('是否可继续加人互动：', existMemberCount , existMemberCount == 4);
    return existMemberCount== 4;
  }
  @action
  addMember(member, isTeacher, offline) {
    let idx = this.findMember(member);
    if (idx != -1) {
      console.log("已存在的音视频成员", member);

      //如果是老师则设置对应在线状态
      if (isTeacher) {
        console.log("额外设置老师状态...");
        this.setTeacherStatus(member.account, offline);
      }
      return;
    }

    //找到最近一个空位置
    const emptyIdx = this.state.members.findIndex(item => {
      return item.account == "";
    });
    if (emptyIdx == -1) {
      console.log("已有4个成员，无法再加");
      return;
    }
    console.log("***** 要放置人员最近一个空位置为：", emptyIdx);
    this.state.members.splice(emptyIdx, 1, member);
    console.log("store --> netcall --> addMember", member);
  }

  @action
  delMember(account) {
    let idx = this.findMember({ account: account });
    if (idx == -1) {
      console.log("不存在的音视频成员", account);
      return;
    }

    this.state.members.splice(idx, 1, {
      account: "",
      self: false
    });
    console.log("store --> netcall --> delMember", account);

    //重新排序
    this.resortMembers();
  }

  @action
  setTeacherStatus(account, offline) {
    let idx = this.findMember({ account: account });
    if (idx == -1) {
      console.log("不存在的音视频成员", account);
      return;
    }
    let teacher = this.state.members[idx];
    teacher.offline = offline;
    this.state.members.splice(idx, 1, teacher);

    console.log("store --> netcall --> setTeacherStatus", account, offline);
  }

  @action
  setVideo(video) {
    this.state.video = video;
    console.log("store --> netcall --> setVideo", video);
  }
  @action
  setAudio(audio) {
    this.state.audio = audio;
    console.log("store --> netcall --> setAudio", audio);
  }
}
