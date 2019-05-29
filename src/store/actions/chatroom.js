/*

 * 房间状态管理
 */

import { observable, computed, action, configure } from "mobx";

import defaultConfig from "../config";
import { Valid } from "../../util";

configure({ enforceActions: 'always' });

export default class {
  @observable
  state = {
    lastTimestamp: 0,//最后一次拉取的时间戳
    canLoadHistory: true, //是否可拉取历史
    showEmojiPanel: false, //是否显示表情卡片
    isShowMemberTab: false, //是否在成员列表tab
    currChatroomId: "", // 当前聊天室id
    currChatroom: null, //当前聊天室对象
    hasPermissionRequest: false, //当前是否有成员请求连麦
    msgs: [], //聊天室的聊天消息列表
    members: [], //聊天室成员列表{type,account, nick, avatar,status,enterTime, audioVolume}
    type: "", //当前用户类型(与聊天室成员的type值一致)
    custom: {}, // 聊天室信息
    rooms: [] //房间列表
  };

  @action
  setLastTimestamp(lastTimestamp) {
    this.state.lastTimestamp = lastTimestamp;
    console.log('store --> chatroom --> setLastTimestamp', lastTimestamp);
  }
  @action
  setCustom(custom) {
    this.state.custom = custom
    console.log('store --> chatroom --> setCustom', custom)
  }
  @action
  setCanLoadHistory(canLoadHistory) {
    this.state.canLoadHistory = canLoadHistory;
    console.log("store --> chatroom --> setCanLoadHistory", canLoadHistory);
  }

  @action
  setShowEmojiPanel(showEmojiPanel) {
    this.state.showEmojiPanel = showEmojiPanel;
    console.log("store --> chatroom --> setShowEmojiPanel", showEmojiPanel);
  }
  @action
  setIsShowMemberTab(isShowMemberTab) {
    this.state.isShowMemberTab = isShowMemberTab;
    console.log("store --> chatroom --> setIsShowMemberTab", isShowMemberTab);
  }

  @action
  setHasPermissionRequest(hasPermissionRequest) {
    this.state.hasPermissionRequest = hasPermissionRequest;
    console.log(
      "store --> chatroom --> setHasPermissionRequest",
      hasPermissionRequest
    );
  }

  /**
   * 是否还有成员请求连麦
   */
  hasPermissionRequestMember() {
    let idx = this.state.members.findIndex(function (element, index) {
      return element.status == 2; //请求连麦
    });
    return idx != -1;
  }

  @action
  setCurrChatroomId(chatroomId) {
    this.state.currChatroomId = chatroomId;
    console.log("store --> chatroom --> setCurrChatroomId", chatroomId);
  }

  @action
  setChatroom(chatroomId, chatroom) {
    if (!chatroomId) return;
    this.state.currChatroom = chatroom;
    console.log("store --> chatroom --> setChatroom", chatroom);
  }

  @action
  setMsgs(msgs) {
    if (!msgs) return;

    if (!Valid.isArray(msgs)) {
      console.error("非消息数组", msgs);
      return;
    }

    //新收到的消息追加到尾部
    this.state.msgs = this.state.msgs.concat(msgs);
    console.log("store --> chatroom --> setMsgs", msgs);
  }

  @action
  addHistoryMsgs(msgs) {
    if (!msgs) return;

    if (!Valid.isArray(msgs)) {
      console.error("非消息数组", msgs);
      return;
    }

    //历史消息追加到头部
    let newMsgs = [];
    msgs.forEach(item => {
      newMsgs.unshift(item);
    });
    this.state.msgs = newMsgs.concat(this.state.msgs);
    console.log("store --> chatroom --> addHistoryMsgs", msgs);
  }
  @action
  clearMsgs() {
    this.state.msgs = [];
    console.log("store --> chatroom --> clearMsgs");
  }

  @action
  setMembers(members) {
    if (!members) {
      return;
    }

    if (!Valid.isArray(members)) {
      console.error("非成员数组", members);
      return;
    }

    //新成员追加在尾部
    this.state.members = this.state.members.concat(members);

    console.log("store --> chatroom --> setMembers", members);

    this.resortMemberLocation();
  }

  @action
  clearMembers() {
    this.state.members = [];
    console.log("store --> chatroom --> clearMembers", this.state.members);
  }

  findMember(member) {
    let idx = this.state.members.findIndex(function (element, index) {
      return member.account == element.account;
    });

    return idx;
  }

  @action
  addMember(member) {
    if (!member) {
      return;
    }

    // 忽略已存在的成员
    let findIdx = this.findMember(member);
    if (findIdx != -1) {
      console.log("已存在的成员：", member, ", idx: ", findIdx);
      return;
    }

    // TODO 后期需要排序处理
    this.state.members.push(member);

    console.log("store --> chatroom --> addMember", member);

    this.resortMemberLocation();
  }

  @action
  delMember(account) {
    if (!account) {
      return;
    }

    // 忽略不存在的成员
    let findIdx = this.findMember({ account: account });
    if (findIdx == -1) {
      console.log("不存在的成员：", account, " 删除失败");
      return;
    }

    // TODO 后期需要排序处理
    this.state.members.splice(findIdx, 1);

    console.log("store --> chatroom --> delMember", account);

    this.resortMemberLocation();
  }

  /**
   * 设置成员的互动状态
   *
   * @param {String} account 云信账号
   * @param {Number} status 成员互动状态值：1互动中，2请求互动，0未互动(默认值)
   */
  @action
  setMemberStatus(account, status) {
    if (!account) {
      return;
    }

    // 忽略不存在的成员
    let findIdx = this.findMember({ account: account });
    if (findIdx == -1) {
      console.log("不存在的成员：", account, " 设置成员互动状态失败");
      return;
    }

    let member = this.state.members[findIdx];
    member.status = status;

    this.state.members.splice(findIdx, 1, member);
    console.log("store --> chatroom --> setMemberStatus", account, status);

    this.resortMemberLocation();
  }

  @action
  setMemberAudioVolume(account, audioVolume) {
    if (!account) {
      return;
    }

    // 忽略不存在的成员
    let findIdx = this.findMember({ account: account });
    if (findIdx == -1) {

      return;
    }

    let member = this.state.members[findIdx];
    member.audioVolume = audioVolume;

    this.state.members.splice(findIdx, 1, member);

  }

  @action
  setType(type) {
    this.state.type = type;
    console.log("store --> chatroom --> setType", type);
  }

  //重新排序聊天成员
  resortMemberLocation() {
    //老师在第一位,互动与请求互动第二区间，非互动成员按加入聊天室先后顺序排列
    let part1 = null;
    let part2 = [];
    let part3 = [];
    let newarray = [];

    this.state.members.forEach(item => {
      //取出老师
      if (item.type == "owner") {
        part1 = item;
      } else if (item.status == 1 || item.status == 2) {
        //取出互动与请求互动成员
        part2.push(item);
      } else {
        //非互动成员
        part3.push(item);
      }
    });
    part3.sort((a, b) => {
      if (a.enterTime < b.enterTime) {
        return -1;
      } else if (a.enterTime > b.enterTime) {
        return 1;
      } else {
        return 0;
      }
    });
    newarray = part2.concat(part3);
    if (part1 != null) {
      newarray.unshift(part1);
    }

    this.state.members = newarray;
    console.log("store --> chatroom --> resortMemberLocation", newarray);
  }

  @action
  setRooms(rooms) {
    if (!rooms) {
      return;
    }

    if (!Valid.isArray(rooms)) {
      console.error("非成员数组", rooms);
      return;
    }

    //新成员追加在尾部
    this.state.rooms = rooms;

    console.log("store --> chatroom --> setRooms", rooms);
  }
}
