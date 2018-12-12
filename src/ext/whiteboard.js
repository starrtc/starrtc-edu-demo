/*

 * 连接白板的各种操作
 * 组件调用方式:
 * 1. import {BB} from 'ext'
 * 2. 注册事件完成监听，在对应的目标组件上做出对应的UI处理
 * 功能点包括:
 * 1. 加入白板房间
 * 2. 连接白板服务器
 * 3. 采集、绘制白板数据
 * 4. 会话结束，退出白板房间
 */
import { Storage } from '../util';

import { StoreWhiteBoard, StoreChatroom } from '../store';
import { Pipes } from '../util';

import EXT_ROOM from '../ext/room'

import $ from 'jquery';

const WhiteBoardState = StoreWhiteBoard.state;
const ChatroomState = StoreChatroom.state;

export default {
  wb: null,
  info: null,
  // 是否正在白板会话中
  calling: false,
  initSDK() {
    if (this.wb) return;
    this.bindEvent();
    this.initDrawPlugin()
  },
  initDrawPlugin() {
    this.drawPlugin = new window.DrawPlugin(WhiteBoardState.node, {
      UID: Storage.get('account'),
      nim: null
    })
    this.drawPlugin.on('data', (obj) => {
      let { toAccount = 0, data } = obj
      if (!data) return
	  EXT_ROOM.sendStreamData(JSON.stringify({"account":toAccount, "data":data}));
    })
  },
  bindEvent() {
    const wb = this.wb;
    const that = this;
  },
  createChannel(roomId) {
    console.log('wb::createChannel', roomId);
  },
  _startSession() {
    
  },
  clearAll() {

    this.wb = null;
    window.whiteboard = null;
    StoreWhiteBoard.whiteboard = null;
    this.drawPlugin.destroy()
    this.drawPlugin = null
  },
  joinChannel(roomId) {
   
    console.log('wb::joinChannel', roomId);
    this.info = {
      channelName: roomId,
      sessionConfig: {
        color: '#000'

      }
    };
    
	  return Promise.resolve();
  },
  _joinChannel() {
   
  },
  leaveChannel() {
    console.log('wb::leaveChannel');
  
    StoreWhiteBoard.reset();
  },
  // 延迟分角色加载
  lazySync() {
    setTimeout(() => {
      console.log('joinChannel SYNC', ChatroomState.type)
      if (!ChatroomState.type) {
        return this.lazySync()
      }
      if (ChatroomState.type !== 'owner') {
        const teacherAccount = Storage.get('teacherAccount')
        console.log('makeSync', teacherAccount)
        this.syncRequest(teacherAccount)
      }
    }, 50)
  },
  lazySyncOwner() {
    setTimeout(() => {
      console.log('joinChannel SYNC', ChatroomState.type)
      if (!ChatroomState.type) {
        return this.lazySyncOwner()
      }
      if (ChatroomState.type === 'owner') {
        // 如果没有数据列表，先尝试拉取
        this.getFileList()
        this.syncBegin()
      }
    }, 50)
  },
  // 设置容器
  setContainer(node) {
    console.log('wb::setContainer', node);
    StoreWhiteBoard.setContainer(node);
    this.drawPlugin && this.drawPlugin.setContainer(node);
  },
  // 设置颜色
  setColor(color) {
    this.drawPlugin && this.drawPlugin.setColor(color);
    StoreWhiteBoard.setColor(color);
  },
  // 在加入互动时，检查确认颜色
  checkColor() {
    this.setColor(WhiteBoardState.currentDrawColor)
  },
  // 观众权限:禁止绘图
  changeRoleToAudience() {
    console.log('wb::changeRoleToAudience');
    this.drawPlugin && this.drawPlugin.changeRoleToAudience();
  },
  // 互动者权限:允许绘图
  changeRoleToPlayer() {
    console.log('wb::changeRoleToPlayer');
    this.drawPlugin && this.drawPlugin.changeRoleToPlayer();
  },
  // 设置绘图模式: 激光笔
  setDrawModeFlag: function() {
    this.drawPlugin && this.drawPlugin.setDrawMode('flag');
    StoreWhiteBoard.setDrawMode('flag');
  },
  // 设置绘图模式: 自由绘图模式
  setDrawModeFree: function() {
    this.drawPlugin && this.drawPlugin.setDrawMode('free');
    StoreWhiteBoard.setDrawMode('free');
  },
  // 撤销
  undo() {
    this.drawPlugin && this.drawPlugin.undo();
  },
  // 反撤销
  redo() {
    this.drawPlugin && this.drawPlugin.redo();
  },
  // 清除
  clear() {
    this.drawPlugin && this.drawPlugin.clear();
  },
  act(obj) {
	this.drawPlugin && this.drawPlugin.act({ account: obj.account, data: obj.data })
  },
  // 文档上传
  uploadFile(data) {
    const fileInput = WhiteBoardState.fileInput;
	$.ajax({
             //几个参数需要注意一下
                 type: "POST",//方法类型
                 dataType: "json",//预期服务器返回的数据类型
                 url: "https://api.starrtc.com/demo/upload_api" ,//url
                 data: data,
				 cache: false,
				 processData: false,
				 contentType: false,
                 }
             ).then((result)=>{
				 console.log(result);//打印服务端返回的数据(调试用)
                     if (result.status == 1) {

						  StoreWhiteBoard.addFile({
							  docId:result.data,
							  name: fileInput.files[0].name,
							  mime: 3,
							  state: 11,
							  percent: 0,
							  prefix: '',
							  transType:10
							});
						 
						  const param = {
							  docId: result.data,
							  name: fileInput.files[0].name,
							  percent: 0,
							  state: WhiteBoardState.serializeFileStateMap['TRANSING']
							};
						
						 StoreWhiteBoard.setFileState(param);
						 
						 var checkTimer = setInterval(() => {
						  // 当前文档是否还在, 是否已经转码完成
							$.get("https://api.starrtc.com/demo/get_doc_info?id="+result.data)
							.then((data)=>{
								data = JSON.parse(data)
								if(data.status == 1)
								{
									
									const param = {
									  docId: result.data,
									  name: fileInput.files[0].name,
									  percent: 100,
									  state: WhiteBoardState.serializeFileStateMap['TRANSCOMPLETE'],
									  pageCount:data.data.length,
									  prefix:"https://api.starrtc.com/uploads/",
									  keyword:"starRTC",
									};
									 StoreWhiteBoard.setFileState(param);
									
									clearInterval(checkTimer);
									checkTimer = null;
								}
							})
							.catch((error)=>{
								console.log(error)
							});
						
						}, 1000);
                     }
			 }).catch((error)=>{
				 alert("异常！");
			 }); 
  },
  // 设置背景
  setImage(index = 1, item = WhiteBoardState.currentFile) {
    console.log('setImage', item);
    const name = item.name.replace(/\.\w+$/, '');
	var tmp = index - 1;
    const url = `${item.prefix}${item.docId}/${item.keyword}-${tmp}.${WhiteBoardState.fileTypeMap[item.transType]}`;
    this.drawPlugin &&
      this.drawPlugin.image({
        url:url,
        docId: item.docId,
        pageCount: item.pageCount,
        currentPage: index,
		item: item,
      });
    StoreWhiteBoard.setCurrentFilePage(index);
  },
  // 取消背景设置
  clearFile() {
    this.drawPlugin && this.drawPlugin.clearImage();
    // 拿掉背景文档
    StoreWhiteBoard.setCurrentFile(-1);
  },
  // 删除文件
  deleteFile(docId) {
	  const param = {
          docId: docId,
          percent: 0,
          state: WhiteBoardState.serializeFileStateMap['TRANSING']
        };
        StoreWhiteBoard.setFileState(param);
        StoreWhiteBoard.deleteFile(docId);
  },
  // 拉取具体文件
  getFile(docId) {
    
  },
  // 拉取文件列表
  getFileList() {
    console.log('getFileList');
  },
  // 同步准备
  syncBegin() {
    this.drawPlugin && this.drawPlugin.syncBegin();
  },
  // 同步请求
  syncRequest(account) {
    this.drawPlugin && this.drawPlugin.syncRequest(account);
  }
};
