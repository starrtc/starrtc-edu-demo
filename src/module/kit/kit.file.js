/*

 * 文档库组件
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import classNames from 'classnames';

import { Alert } from '../../util'

import { Button, Input, Row, Col, Tip, Progress } from '../../component';

import EXT_WHITEBOARD from '../../ext/whiteboard';

import { StoreWhiteBoard } from '../../store';
const WhiteBoardState = StoreWhiteBoard.state;

@observer
export default class extends Component {
  componentWillReceiveProps(props) {
    console.log('componentWillReceiveProps', props);
  }
  open() {}
  close() {
    StoreWhiteBoard.setFileKitEnable(false);
  }
  fileChange() {
	var formData = new FormData(document.getElementById("uploadForm"))
    EXT_WHITEBOARD.uploadFile(formData);
  }
  useFile(item) {
    StoreWhiteBoard.setCurrentFile(item.docId);
    StoreWhiteBoard.setFileKitEnable(false);
    EXT_WHITEBOARD.setImage(1, item);
    EXT_WHITEBOARD.setDrawModeFlag();
  }
  deleteFile(item) {
    Alert.open({
      title: '提示',
      msg:
        '<div class="u-stop-interaction"><i class="u-icon-tip"></i>确认要删除该文件吗？</div>',
      isHtml: true,
      btns: [
        {
          label: '删除',
          clsName: 'u-btn-smaller f-mgr-10',
          onClick: () => {
            EXT_WHITEBOARD.deleteFile(item.docId);
            Alert.close();
          }
        },
        {
          label: '取消',
          clsName: 'u-btn-cancle',
          onClick: () => {
            Alert.close();
          }
        }
      ]
    });
  }
  // 渲染文件上传状态
  renderState(item) {
    let dom = null;
    const serializeFileStateMap = WhiteBoardState.serializeFileStateMap;
    const unserializeFileStateText = WhiteBoardState.unserializeFileStateText;
    if (item.state - serializeFileStateMap['TRANSCOMPLETE'] === 0) {
      dom = (
        <Col span={2} className="m-kit-file-item-option">
          <Button className="u-btn-smaller" onClick={() => this.useFile(item)}>
            使用
          </Button>
          <Button
            className="u-btn-smaller"
            onClick={() => this.deleteFile(item)}
          >
            删除
          </Button>
        </Col>
      );
    }
    if (
      item.state - serializeFileStateMap['TRANSTIMEOUT'] === 0 ||
      item.state - serializeFileStateMap['TRANSFAIL'] === 0 ||
      item.state - serializeFileStateMap['UPLOADFAIL'] === 0
    ) {
      dom = (
        <Col span={2} className="m-kit-file-item-option">
          <span>{unserializeFileStateText[item.state]}</span>
          <span
            className="m-kit-file-cancel"
            onClick={() => this.deleteFile(item)}
          >
            删除
          </span>
        </Col>
      );
    }
    if (
      item.state - serializeFileStateMap['TRANSING'] === 0 ||
      item.state - serializeFileStateMap['UPLOADING'] === 0 ||
      item.state - serializeFileStateMap['PRETRANS'] === 0
    ) {
      dom = (
        <Col span={2} className="m-kit-file-item-option">
          <span>{unserializeFileStateText[item.state]}</span>
          <span>({item.percent || 0}%)</span>
          <span
            className="m-kit-file-cancel"
            onClick={() => this.deleteFile(item)}
          >
            取消
          </span>
        </Col>
      );
    }
    return dom;
  }
  render() {
    console.log('render kit.file');
    return (
      WhiteBoardState.fileKitEnable && (
        <Row className="m-kit m-kit-file">
          <Col span={2} className="m-kit-file-header">
            <span>文档库</span>
            <i className="u-icon iconfont icon-close" onClick={this.close} />
            {WhiteBoardState.showFileTip && (
              <Tip message="关闭文档库窗口，不影响上传" time={5} />
            )}
          </Col>
          <Col
            span={2}
            className={`m-kit-file-body ${
              WhiteBoardState.fileList.length === 0 ? 'empty' : ''
            }`}
          >
            {WhiteBoardState.fileList.map((item, index) => (
              <div key={index} className="m-kit-file-item">
                <Row className="m-kit-file-content">
                  <Col
                    span={1}
                    className={`m-kit-file-item-preview ${
                      WhiteBoardState['serializefileTypeMap'][item.type]
                    }`}
                  />
                  <Col span={3} className="m-kit-file-item-desc">
                    {item.name}
                  </Col>
                  {this.renderState(item)}
                </Row>
                <Progress percent={item.percent} visible={true} />
              </div>
            ))}
          </Col>
          <Col span={2} className="m-kit-file-footer">
            {WhiteBoardState.showFileTip && (
              <Tip
                message="上传文档不超过50页"
                time={5}
                onClose={() => {
                  console.log('上传文档不超过50页 关闭');
                  StoreWhiteBoard.setFileTip(false);
                }}
              />
            )}
			<form id="uploadForm" name="form2" encType="multipart/form-data" method="post" action={window.aecRequestBaseURL + "/doc/upload.php"}>
            <Input
              domRef={input => {
                if (input) {
                  StoreWhiteBoard.setFileInput(input);
                }
              }}
              multiple={true}
              onChange={this.fileChange}
              type="file"
              accept=".pdf,.ppt,.pptx"
              className="m-kit-file-select"
			  name="my_field"
            />
			<input type="hidden" name="action" value="simple" />
            上传文档(PDF/PPT/PPTX)
			</form>
          </Col>
        </Row>
      )
    );
  }
}
