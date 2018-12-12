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


ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
