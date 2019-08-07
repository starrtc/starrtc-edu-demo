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
var webrtcIP = "123.103.93.74";	

window.aecRequestBaseURL = "https://www.starrtc.com/aec";

/* var LOG_LEVEL = {
	LOG_LEVEL_DEBUG: i++,
	LOG_LEVEL_INFO: i++,
	LOG_LEVEL_WARN: i++,
	LOG_LEVEL_ERROR: i++ */

//设置日志等级，开启低等级日志会包含高等级日志，如开启DEBUG，则同时开启INFO、WARN、ERROR，默认为开启DEBUG
window.StarRtc.InitlogLevel(window.StarRtc.LOG_LEVEL.LOG_LEVEL_DEBUG);

//window.StarRtc.Instance.setConfigUseAEC(true);    							//是否开启AEC

window.StarRtc.Instance.setMsgServerInfo(privateURL, 19903) 					//ip, websocket port  //需要手动从浏览器输入 https://ip:29991 信任证书

window.StarRtc.Instance.setChatRoomServerInfo(privateURL, 19906) 			//ip, websocket port //需要手动从浏览器输入 https://ip:29993 信任证书

window.StarRtc.Instance.setSrcServerInfo(privateURL, 19934, 19935, webrtcIP)  			//ip, websocket port, webrtc port, webrtc ip//需要手动从浏览器输入 https://ip:29994 信任证书

window.StarRtc.Instance.setVdnServerInfo(privateURL, 19940, 19941, webrtcIP) 			//ip, websocket port, webrtc port, webrtc ip //需要手动从浏览器输入 https://ip:29995 信任证书

window.StarRtc.Instance.setVoipServerInfo(privateURL, 10086, 10087, 10088, webrtcIP) 	//ip, voipServer port, websocket port, webrtc port, webrtc ip //需要手动从浏览器输入 https://ip:29992 信任证书

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
