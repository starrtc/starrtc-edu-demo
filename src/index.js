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
window.DrawPlugin = DrawPlugin;

////////////////////////共有云私有云区别搜索 StarRtc.Instance.configModePulic 查看

////////////////////////私有云改配置///////////////////////
///////////////////////以下10.90.7.70需替换为私有部署IP////

//StarRtc.Instance.setConfigModePulic(false);

//StarRtc.Instance.setMsgServerInfo("10.90.7.70", 19903) 					//ip, websocket port  //需要手动从浏览器输入 https://10.90.7.70:29991 信任证书

//StarRtc.Instance.setchatRoomServerInfo("10.90.7.70", 19906) 			//ip, websocket port //需要手动从浏览器输入 https://10.90.7.70:29993 信任证书

//StarRtc.Instance.setSrcServerInfo("10.90.7.70", 19934, 19935)  			//ip, websocket port, webrtc port //需要手动从浏览器输入 https://10.90.7.70:29994 信任证书

//StarRtc.Instance.setVdnServerInfo("10.90.7.70", 19940, 19941) 			//ip, websocket port, webrtc port //需要手动从浏览器输入 https://10.90.7.70:29995 信任证书

//StarRtc.Instance.setVoipServerInfo("10.90.7.70", 10086, 10087, 10088) 	//ip, voipServer port, websocket port, webrtc port //需要手动从浏览器输入 https://10.90.7.70:29992 信任证书

//StarRtc.Instance.setWebrtcServerIP("10.90.7.70");

////////////////////////公有云改配置///////////////////////

//StarRtc.Instance.setConfigModePulic(true);

//StarRtc.Instance.setLoginServerUrl("ips2.starrtc.com");

//StarRtc.Instance.setMsgScheduleUrl("ips2.starrtc.com");

//StarRtc.Instance.setChatRoomScheduleUrl("ips2.starrtc.com");

//StarRtc.Instance.setSrcScheduleUrl("ips2.starrtc.com");

//StarRtc.Instance.setVdnScheduleUrl("ips2.starrtc.com");

//StarRtc.Instance.setVoipServerUrl("ips2.starrtc.com");

//StarRtc.Instance.setWorkServerUrl("https://api.starrtc.com/public");

//StarRtc.Instance.setWebrtcServerIP("192.168.0.1");

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
