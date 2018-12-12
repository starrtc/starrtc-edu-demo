/*

 * 账号注册页面
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { PageHeader, PageBody, PageFooter } from 'layout';
import { Button, Row, Col, Input } from '../../component';
import { Storage, Page, Valid, MD5, CheckBroswer } from '../../util';

@observer
export default class Regist extends Component {
  state = {
    nickname: '',
    username: '',
    password: '',
    errorTip: '', //注册错误消息
    showErrorTip: false,
    canRegist: false, //是否可注册
    hasUsername: false,
    hasNickname: false,
    hasPassword: false,
    registLoading: false //注册中状态
  };
  componentDidMount() {
    CheckBroswer({
      success: this.init.bind(this)
    });
  }
  init() {
    this.usernameInput.focus();
    // 校验是否登录了
    
  }
  login() {
    Page.to('login');
  }

  changeUsername = e => {
    const v = e.target.value;
    if (Valid.isBlank(v)) {
      this.setState({
        hasUsername: false,
        username: '',
        canRegist: false
      });
      return;
    }
    this.setState((prevState, props) => ({
      username: v,
      hasUsername: true,
      canRegist: prevState.hasNickname && prevState.hasPassword
    }));
  };

  changeNickname = e => {
    const v = e.target.value;
    if (Valid.isBlank(v)) {
      this.setState({
        hasNickname: false,
        nickname: '',
        canRegist: false
      });
      return;
    }

    this.setState((prevState, props) => ({
      nickname: v,
      hasNickname: true,
      canRegist: prevState.hasUsername && prevState.hasPassword
    }));
  };

  changePassword = e => {
    const v = e.target.value;
    if (Valid.isBlank(v)) {
      this.setState({
        hasPassword: false,
        password: '',
        canRegist: false
      });
      return;
    }
    this.setState((prevState, props) => ({
      password: v,
      hasPassword: true,
      canRegist: prevState.hasUsername && prevState.hasNickname
    }));
  };

  submit = e => {
    if (!this.state.canRegist || this.state.registLoading) {
      console.log('不可点击注册或正在注册中...');
      return;
    }

    //预防性控制
    if (Valid.isBlank(this.state.username)) {
      this.setState({
        showErrorTip: true,
        errorTip: '请输入账号'
      });
      this.usernameInput.focus();
      return;
    }

    // username 格式校验
    if (!this.validateFormat('username', this.state.username)) {
      this.setState({
        showErrorTip: true,
        errorTip: '账号限字母或数字'
      });
      this.usernameInput.focus();
      return;
    }

    if (Valid.isBlank(this.state.nickname)) {
      this.setState({
        showErrorTip: true,
        errorTip: '请输入昵称'
      });
      this.nicknameInput.focus();
      return;
    }

    // nickname 格式校验
    if (!this.validateFormat('nickname', this.state.nickname)) {
      this.setState({
        showErrorTip: true,
        errorTip: '昵称限汉字、字母或数字'
      });
      this.nicknameInput.focus();
      return;
    }

    if (Valid.isBlank(this.state.password)) {
      this.setState({
        showErrorTip: true,
        errorTip: '请输入密码'
      });
      this.passwordInput.focus();
      return;
    }

    //password 格式校验
    if (
      this.state.password.length < 6 ||
      !this.validateFormat('password', this.state.password)
    ) {
      this.setState({
        showErrorTip: true,
        errorTip: '密码限6～20位字母或数字'
      });
      this.passwordInput.focus();
      return;
    }

    this.setState({
      showErrorTip: false,
      errorTip: '',
      registLoading: true
    });

    //NIM注册
    this.requestRegist({
      username: this.state.username,
      nickname: this.state.nickname,
      password: this.state.password
    });
  };

  validateFormat(key, value) {
    switch (key) {
      //20位字母或数字
      case 'username':
        return /^[0-9A-Za-z]{1,20}$/.test(value);
        break;
      //10位汉字，字母或数字
      case 'nickname':
        return /^[\u4e00-\u9fa50-9A-Za-z]{1,10}$/.test(value);
        break;
      //6-20位字母或数字
      case 'password':
        return /^[0-9A-Za-z]{6,20}$/.test(value);
        break;
      default:
        //ignore
        return true;
        break;
    }
  }

  requestRegist(data) {
   
  }

  requestLogin(data) {
    const account = data.account;
    const token = MD5(data.pwd);

    //用于在非登录页面登录
    Storage.set('account', account);
    Storage.set('token', token);

    
  }

  render() {
    console.log('render regist');
    const state = this.state;
    return (
      <div className="m-login">
        <div className="form-part">
          <div className="form-part-inner">
            <div className="title">在线教育</div>
            <div className="subtitle">Web Demo</div>
            <div className="box box-regist">
              <div className="form-item">
                <label className="form-label">账号:限20位字母或数字</label>
                <Input
                  value={state.username}
                  onChange={this.changeUsername}
                  maxLength={20}
                  domRef={input => {
                    this.usernameInput = input;
                  }}
                />
              </div>
              <div className="form-item">
                <label className="form-label">
                  昵称:限10位汉字、字母或数字
                </label>
                <Input
                  value={state.nickname}
                  onChange={this.changeNickname}
                  maxLength={10}
                  domRef={input => {
                    this.nicknameInput = input;
                  }}
                />
              </div>
              <div
                className={
                  state.showErrorTip ? 'form-item form-item-1' : 'form-item'
                }
              >
                <label className="form-label">密码:6-20位字母或数字</label>
                <Input
                  type="password"
                  value={state.password}
                  onChange={this.changePassword}
                  maxLength={20}
                  domRef={input => {
                    this.passwordInput = input;
                  }}
                />
              </div>
              <div className="form-item f-tar">
                <div className="errortip" hidden={!state.showErrorTip}>
                  {state.errorTip}
                </div>
                <div>
                  <Button
                    onClick={this.submit}
                    loading={state.registLoading}
                    disabled={!state.canRegist}
                  >
                    注册
                  </Button>
                </div>
                <div>
                  <a
                    href="javascript:void(0);"
                    className="gotoLogin"
                    onClick={this.login}
                  >
                    已有账号?直接登录
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="banner" />
      </div>
    );
  }
}
