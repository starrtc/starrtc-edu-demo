
import React, { Component } from 'react';
import classNames from 'classnames';
import { observer } from "mobx-react";

import { StoreNim, StoreChatroom, StoreNetcall, StoreWhiteBoard } from "../../store";
const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

@observer
export default class extends Component {
  render() {
    const {
      visible,
    } = this.props;
    const ua = window.navigator.userAgent;
    const isChrome = ua.indexOf("Chrome") && window.chrome;
    let shareText = '';
    if (isChrome) {
      if (NetcallState.chromeDown) {
        shareText = <div className="video-share-container">
          <p className="share-text">检测到您还没有安装屏幕共享插件，请先下载插件，安装完成之后<a href="javascript:;" onClick={this.reload}>刷新</a>页面，体验屏幕共享功能。</p>
          <a className="share-plug" href="https://app.netease.im/webdemo/3rd/chrome/gapafbpmfemleaplicdhhcikajbogpkf_main.crx">下载Chrome插件</a>
          <p className="share-text2">提示：下载完插件，请先参考<a href="http://dev.netease.im/docs/product/%E9%80%9A%E7%94%A8/Demo%E6%BA%90%E7%A0%81%E5%AF%BC%E8%AF%BB/%E5%9C%A8%E7%BA%BF%E6%95%99%E8%82%B2Demo/Web%E6%BA%90%E7%A0%81%E5%AF%BC%E8%AF%BB?#Chrome%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E6%8F%92%E4%BB%B6%E5%AE%89%E8%A3%85" target="_blank">Chrome屏幕共享插件安装教程</a>，再安装插件</p>
        </div>
      } else {
        shareText = <div className="video-share-container">
          <video id="videoShare" className="video-share" width="100%" onClick={this.videoExitFullscreen}/>
          <div className="video-fullscreen-box">
            <span className="video-fullscreen" onClick={this.fullScreen.bind(this, 'videoShare')}></span>
          </div>
          <div className="change-video u-btn u-btn u-btn-smaller" onClick={this.shareScreen}>
            切换
          </div>
        </div>
      }
    } else {
      shareText = <div className="share-text">该浏览器下暂不支持屏幕共享，请在Chrome浏览器下打开Web端教育demo，使用屏幕共享功能。若未下载Chrome浏览器，请先<a href="javascript:;" onClick={this.downChrome}>下载Chrome浏览器</a>。</div >
    }
    return (
      <div className={classNames("m-whiteboard-container", visible ? '' : 'hide')}>
        {shareText}
      </div>
    );
  }
  /**
   *重新加载页面
   *
   */
  reload() {
    window.location.reload()
  }
  /**
   *下载chrome
   *
   */
  downChrome() {
    window.open("https://www.baidu.com/s?wd=chrome");
  }
  /**
   * 显示全屏
   * @param {Object} element
   */
  launchFullscreen(element) {
    if(element.requestFullscreen) {
      element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if(element.msRequestFullscreen){
      element.msRequestFullscreen();
    } else if(element.webkitRequestFullscreen) {
      element.webkitRequestFullScreen();
    }
  }
  /**
   *退出全屏
   */
  videoExitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
  /**
   *全屏
   */
  fullScreen(id) {
    this.launchFullscreen(document.getElementById('videoShare'))
  }
  /**
   *屏幕共享
   */
  shareScreen() {
    const ua = window.navigator.userAgent;
    const isChrome = ua.indexOf("Chrome") && window.chrome;
    if (!isChrome) {
      return
    }
    if (!NetcallState.hasShareScreen) {
      NetcallAction.setHasShareScreen(true);
      
    }

  }
}
