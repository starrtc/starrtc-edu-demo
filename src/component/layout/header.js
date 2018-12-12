import React, { Component } from "react";
import classNames from "classnames";

import { observer } from "mobx-react";

import { StoreNim, StoreChatroom, StoreNetcall } from "../../store";

import EXT_NIM from "../../ext/nim";
import EXT_WHITEBOARD from "../../ext/whiteboard";
import EXT_ROOM from '../../ext/room'

import { Storage, Alert } from "../../util";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

@observer
export default class extends Component {
  //退出点击响应
  logout = () => {
    console.log("退出im....");
    Alert.open({
      title: "操作确认",
      msg:
        '<div class="u-logoutim"><i class="u-icon-tip"></i> 确认要退出在线教育Demo？</div>',
      isHtml: true,
      btns: [
        {
          label: "退出",
          clsName: "u-btn-smaller f-mgr-10 ",
          onClick: () => {
            console.log("【退出IM弹窗】 --> 确认");
            this.doLogoutIM();
          }
        },
        {
          label: "取消",
          clsName: "u-btn-cancle",
          onClick: () => {
            console.log("【退出IM弹窗】 --> 取消");
            Alert.close();
          }
        }
      ]
    });
  };

  doLogoutIM = () => {
    Alert.close();
    EXT_NIM.logout();
  };

  doLogoutChatroom = () => {
	  EXT_ROOM.logout();
  };

  //老师退出教学
  doClose4Teacher = () => {
    console.log("老师：结束教学...");
    Alert.close();
	this.doLogoutChatroom();
  };

  //学生退出房间
  doClose4Student = () => {
    console.log("学生：退出房间...");
    Alert.close();
    this.doLogoutChatroom();
  };
  doCancle = () => {
    console.log("【关闭确认弹窗】 -> 取消...");
    Alert.close();
  };

  closeChatroom = () => {
    const type = ChatroomState.type;
    const isTeacher = type == "owner";
    const msg =
      '<div class="u-exitroom">' +
      (isTeacher
        ? '<i class="u-icon-tip"></i> 确认要结束教学? '
        : '<i class="u-icon-tip"></i> 确认要退出房间?') +
      "</div>";
    const btns = [
      {
        clsName: "u-btn-smaller f-mgr-10 f-w-70"
      },
      {
        label: "取消",
        clsName: "u-btn-cancle",
        onClick: () => {
          this.doCancle();
        }
      }
    ];

    if (isTeacher) {
      btns[0].label = "结束教学";
      btns[0].onClick = () => {
        this.doClose4Teacher();
      };
    } else {
      btns[0].label = "退出房间";
      btns[0].onClick = () => {
        this.doClose4Student();
      };
    }

    //显示弹窗
    Alert.open({
      title: "提示",
      msg: msg,
      isHtml: true,
      btns: btns
    });
  };

  render() {
    const { isHome } = this.props;
    return (
      <div className="m-header">
        <div className="logo">
          在线教育DEMO{ChatroomState.type
            ? ChatroomState.type == "owner" ? "-教师端" : "-学生端"
            : ""}
        </div>
        <div className="opt">
          {NimState.account}
          <div className="opt-inner">
            {isHome ? (
              <a
                href="javascript:void(0);"
                className="logout"
                onClick={this.logout}
              >
                退出
              </a>
            ) : (
              <a
                href="javascript:void(0);"
                className="close"
                onClick={this.closeChatroom}
              >
                <span>关闭</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
}
