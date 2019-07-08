/*

 * 登录页面
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Button, Row, Col, Input } from '../../component';

import { Alert, Valid, Storage, MD5, Page, CheckBroswer } from '../../util';

import EXT_NIM from '../../ext/nim'

import { StoreNim } from "../../store";

const NimState = StoreNim.state;
const NimAction = StoreNim;

@observer
export default class Login extends Component {
  state = {
    account: '',
    pwd: '',
    errorTip: '', //登录错误消息
    showErrorTip: false,
    canLogin: false, //是否可登录
    hasAccount: false,
    hasPwd: false,
    loginLoading: false //登录中状态
  };

  componentDidMount() {
    CheckBroswer({
      success: this.autoLogin.bind(this)
    })
  }

  autoLogin() {

    if (NimState.nim) {
      Page.to('home');
    }

    console.log('login:开始自动登录nim过程...');

    const account = Storage.get('account');
    const token = Storage.get('token');
    if (!account || !token) {
      console.error('login:自动登录nim:缺少account或token');
      this.accountInput.focus();
      return;
    }

    this.setState({
      showErrorTip: false,
      errorTip: '',
      loginLoading: true
    });

    this.requestLogin({
      account: account,
      pwd: token
    });

  }

  changeAccount = e => {
    const account = e.target.value;
    if (Valid.isBlank(account)) {
      this.setState({
        hasAccount: false,
        account: '',
        canLogin: false
      });
      return;
    }

    this.setState((prevState, props) => ({
      hasAccount: true,
      account: account.trim(),
      canLogin: prevState.hasPwd
    }));
  };

  changePwd = e => {
    const pwd = e.target.value;
    if (Valid.isBlank(pwd)) {
      this.setState({
        hasPwd: false,
        pwd: '',
        canLogin: false
      });
      return;
    }

    this.setState((prevState, props) => ({
      hasPwd: true,
      pwd: pwd.trim(),
      canLogin: prevState.hasAccount
    }));
  };

  submit = () => {
    if (!this.state.canLogin || this.state.loginLoading) {
      console.log('不可点击登录或正在登录中...');
      return;
    }

    //预防性控制
    if (Valid.isBlank(this.state.account)) {
      this.setState({
        showErrorTip: true,
        errorTip: '账号不能为空'
      });
      return;
    }

    if (Valid.isBlank(this.state.pwd)) {
      this.setState({
        showErrorTip: true,
        errorTip: '密码不能为空'
      });
      return;
    }

    this.setState({
      showErrorTip: false,
      errorTip: '',
      loginLoading: true
    });

    //NIM登录
    this.requestLogin({
      account: this.state.account,
      pwd: this.state.pwd
    });
  };

  regist() {
    console.log('跳转到注册页...');

    Page.to('regist');
  }

  requestLogin(data) {
    const account = data.account;
    const token = MD5(data.pwd);
    EXT_NIM.login(account, token)
      .then(() => {
        Storage.set('account', data.account);
        Storage.set('token', token);
        Page.to('home');
      })
      .catch(err => {
        Storage.remove('account');
        Storage.remove('token');

        this.setState({
          showErrorTip: true,
          errorTip: '',
          loginLoading: false
        });

        console.log(err);
      });

  }

  render() {
    console.log('render login');
    const state = this.state;
    return (
      <div className="m-login">
        <div className="form-part">
          <div className="form-part-inner">
            <div className="title">在线教育</div>
            <div className="subtitle">Web Demo</div>
            <div className="box">
              <div className="form-item">
                <label className="form-label">请输入账号（任意填写）</label>
                <Input
                  value={state.account}
                  onChange={this.changeAccount}
                  domRef={input => {
                    this.accountInput = input;
                  }}
                />
              </div>
              <div
                className={
                  state.showErrorTip ? 'form-item form-item-1' : 'form-item'
                }
              >
                <label className="form-label">请输入密码（任意填写）</label>
                <Input
                  type="password"
                  value={state.pwd}
                  onChange={this.changePwd}
                  domRef={input => {
                    this.pwdInput = input;
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
                    loading={state.loginLoading}
                    disabled={!state.canLogin}
                  >
                    登录
                  </Button>
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
