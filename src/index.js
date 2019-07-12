import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/skin/base.css';
import './assets/css/skin/iconfont.css';
import './assets/css/skin/main.less';
import StarRtc from './sdk/star_rtc_lib.min'
import DrawPlugin from './sdk/DrawPlugin'
import App from './App';
import registerServiceWorker from './registerServiceWorker';

window.StarRtc = StarRtc;
window.StarRtc.Instance = new StarRtc.StarSDK();
window.DrawPlugin = DrawPlugin;

////////////////////////私有云改配置///////////////////////
///////////////////////以下privateURL需替换为私有部署IP////

var privateURL = "demo.starrtc.com";

window.aecRequestBaseURL = "https://www.starrtc.com/aec";

//window.StarRtc.Instance.setConfigUseAEC(true);    							//是否开启AEC

window.StarRtc.Instance.setMsgServerInfo(privateURL, 19903) 					//ip, websocket port  //需要手动从浏览器输入 https://ip:29991 信任证书

window.StarRtc.Instance.setChatRoomServerInfo(privateURL, 19906) 			//ip, websocket port //需要手动从浏览器输入 https://ip:29993 信任证书

window.StarRtc.Instance.setSrcServerInfo(privateURL, 19934, 19935)  			//ip, websocket port, webrtc port //需要手动从浏览器输入 https://ip:29994 信任证书

window.StarRtc.Instance.setVdnServerInfo(privateURL, 19940, 19941) 			//ip, websocket port, webrtc port //需要手动从浏览器输入 https://ip:29995 信任证书

window.StarRtc.Instance.setVoipServerInfo(privateURL, 10086, 10087, 10088) 	//ip, voipServer port, websocket port, webrtc port //需要手动从浏览器输入 https://ip:29992 信任证书

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
