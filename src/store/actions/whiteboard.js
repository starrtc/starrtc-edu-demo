/*

 * 白板各种状态管理
 */

import { observable, computed, action, configure } from 'mobx';

import defaultConfig from '../config';

configure({ enforceActions : 'always' });

// 文档上传状态
// 上传中
// 转码中
// 上传失败
// 转码失败
// 完成

export default class wbConfig {
  @observable
  state = Object.assign({}, defaultConfig.wbInfo, {
    serializeFileStateMap: defaultConfig.serializeFileStateMap,
    unserializeFileStateMap: defaultConfig.unserializeFileStateMap,
    unserializeFileStateText: defaultConfig.unserializeFileStateText,
    fileTypeMap: defaultConfig.fileTypeMap,
    fileInput: null,
    fileKitEnable: false,
    // 限制的文档类型数字
    serializefileTypeMap: defaultConfig.serializefileTypeMap,
    unserializefileTypeMap: defaultConfig.unserializefileTypeMap,
    currentFile: null,
    fileList: [],
    fileListCount: 0,
    colorList: ['#000', '#35CBFF', '#FFDD3F', '#FF553C', '#61D25C', '#B65CFF'],
    currentDrawMode: 'free',
    currentDrawColor: '#000',
    showFileTip: true
  });

  @action
  reset() {
    console.log('store --> wb --> reset');
    this.state.fileList = [];
    this.state.currentFile = null;
    this.state.fileListCount = 0;
    this.state.currentDrawMode = 'free';
    this.state.currentDrawColor = '#000';
    this.state.fileKitEnable = false;
  }

  @action
  setContainer(node) {
    console.log('store --> wb --> setContainer', node);
    this.state.node = node;
  }

  @action
  setStatus(obj = {}) {
    console.log('store --> wb --> setStatus', obj);
    this.state = Object.assign(this.state, obj);
  }

  @action
  setColor(color) {
    console.log('store --> wb --> setColor', color);
    this.state.currentDrawColor = color;
  }

  @action
  setStyle(style) {
    console.log('store --> wb --> setStyle', style);
    this.state.style = style;
  }

  @action
  setFileKitEnable(isOn) {
    console.log('store --> wb --> setFileKitEnable', isOn);
    this.state.fileKitEnable = !!isOn;
  }

  @action
  setFileInput(node) {
    console.log('store --> wb --> setFileInput', node);
    this.state.fileInput = node;
  }

  @action
  setCurrentFile(docId) {
    console.log('store --> wb --> setCurrentFile docId', docId);
    if (!docId) return;
    const file = this.state.fileList.find(item => item.docId === docId);
    this.state.currentFile = file;
    if (file) {
      file.currentPage = 1;
    }
  }

  @action
  setCurrentFilePage(index = 1) {
    if (!this.state.currentFile) return;
    this.state.currentFile.currentPage = index;
    console.log(
      'store --> wb --> setCurrentFilePage index',
      index,
      this.state.currentFile
    );
  }

  @action
  deleteFile(docId) {
    console.log('store --> wb --> deleteFile docId', docId);
    if (!docId) return;
    const index = this.state.fileList.findIndex(item => item.docId === docId);
    index !== -1 && this.state.fileList.splice(index, 1);
  }

  @action
  addFile(obj = {}) {
    console.log('store --> wb --> addFile docId', obj);
    if (!obj.docId) return;
    let index = this.state.fileList.findIndex(item => item.docId === obj.docId);
    index === -1 && this.state.fileList.unshift(obj);
  }

  @action
  setFileState(obj = {}) {
    const { docId } = obj;
    if (!docId) {
      console.error('设置文件状态失败，参数缺失docId');
      return;
    }
    const state = this.state;
    let file = state.fileList.find(item => item.docId === docId);

    if (!file) return;
    file = Object.assign(file, obj);
    console.log('store --> wb --> setFileState', obj);

    if (file.mime && !file.type) {
      file.type = state.unserializefileTypeMap[file.mime];
    }
    // 开始转码->开启虚拟转码进度
    if (file.state - 2 === 0) {
      this.startFileProgress(file.docId);
    } else if (!/(2|11)/.test(file.state)) {
      file.percent = 0;
      file.timer && clearInterval(file.timer);
      file.timer = null;
    }
  }

  // 虚拟转码进度
  @action
  startFileProgress(docId) {
    console.log('store --> wb --> startFileProgress', docId);
    if (!docId) return;
    let file = this.state.fileList.find(item => item.docId === docId);

    if (!file || file.timer) return;
    file.timeStart = Date.now();
    file.timer = setInterval(() => {
      // 当前文档是否还在, 是否已经转码完成
      if (
        !this.state.fileList.find(item => item.docId === docId) ||
        /[345]/.test(file.state) ||
        file.percent > 99
      ) {
        let percent = file.percent > 99 ? 99.99 : 0;
        this.setFileProgress(docId, percent)
        clearInterval(file.timer);
        //file.timer = null;
        return;
      }
      let i = Math.floor((Date.now() - file.timeStart) / 1000);
      i = (1 - Math.pow(0.97716, i)) * 100;
      this.setFileProgress(docId, i.toFixed(2));
    }, 1000);
  }

  // 更新转码进度
  @action
  setFileProgress(docId, percent) {
    let file = this.state.fileList.find(item => item.docId === docId);
    if (!file) return;
    file.percent = percent;
    console.log('setFileProgress', docId, file.name, file.percent);
  }

  @action
  setFileList(obj = {}) {
    const { list = [], count = 0 } = obj;
    this.state.fileList = list;
    if (count) {
      this.state.fileListCount = count;
    }
    // 对list遍历确认是否要进行虚拟转码进度展示
    list.map(file => {
      if (file.state - 2 === 0) {
        this.setFileProgress(file.docId, 99.99);
      }
    });
    console.log('store --> wb --> setFileList', this.state.fileList);
  }

  @action
  setDrawMode(mode = 'free') {
    console.log('store --> wb --> setDrawMode', mode);
    if (!/(flag|free)/.test(mode)) return;
    this.state.currentDrawMode = mode;
  }

  @action
  setDrawColor(color = '#000') {
    console.log('store --> wb --> setDrawColor', color);
    this.state.currentDrawColor = color;
  }

  @action
  setFileTip(isEnable) {
    console.log('store --> wb --> setFileTip', isEnable);
    this.state.showFileTip = !!isEnable;
  }
}
