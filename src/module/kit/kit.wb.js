/*

 * 白板工具栏组件: 底部最基本的工具栏
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import classNames from 'classnames';

import { Row, div, Tooltip, Pagination } from '../../component';
import ColorKit from './kit.color';

import EXT_WHITEBOARD from '../../ext/whiteboard';

import { StoreWhiteBoard, StoreChatroom, StoreNetcall } from '../../store';

const NetcallState = StoreNetcall.state;
const ChatroomState = StoreChatroom.state;
const WhiteBoardState = StoreWhiteBoard.state;

@observer
export default class extends Component {
  setDrawModeFlag() {
    EXT_WHITEBOARD.setDrawModeFlag();
  }
  setDrawModeFree() {
    EXT_WHITEBOARD.setDrawModeFree();
  }
  undo() {
    EXT_WHITEBOARD.undo();
  }
  clear() {
    EXT_WHITEBOARD.clear();
  }
  openFileKit() {
    StoreWhiteBoard.setFileKitEnable(true);
  }
  resetFileKit() {
    StoreWhiteBoard.setFileKitEnable(false);
    EXT_WHITEBOARD.clearFile();
    EXT_WHITEBOARD.setDrawModeFree();
  }
  onPageChange(index) {
    console.log('onPageChange', index);
    EXT_WHITEBOARD.clear();
    EXT_WHITEBOARD.setImage(index);
  }
  render() {
    return (
      NetcallState.hasPermission && (
        <Row className="m-kit m-kit-wb">
          <div className="m-kit-wb-option">
            {ChatroomState.type === 'owner' && (
              <Tooltip title="激光笔">
                <i
                  className={`u-icon iconfont icon-dot ${
                    WhiteBoardState.currentDrawMode === 'flag' ? 'active' : ''
                  }`}
                  onClick={this.setDrawModeFlag}
                />
              </Tooltip>
            )}
            <Tooltip>
              {WhiteBoardState.currentDrawMode === 'free' && <ColorKit />}
              <i
                className={`u-icon iconfont icon-pen ${
                  WhiteBoardState.currentDrawMode === 'free' ? 'active' : ''
                }`}
                onClick={this.setDrawModeFree}
              />
            </Tooltip>
            <Tooltip title="撤销">
              <i className="u-icon iconfont icon-undo" onClick={this.undo} />
            </Tooltip>
            {ChatroomState.type === 'owner' && (
              <Tooltip title="清屏">
                <i
                  className="u-icon iconfont icon-clear"
                  onClick={this.clear}
                />
              </Tooltip>
            )}
          </div>
          {ChatroomState.type === 'owner' &&
            WhiteBoardState.currentFile && (
              <div className="m-kit-wb-pagination">
                <Tooltip title="分页">
                  <Pagination
                    id={WhiteBoardState.currentFile.docId}
                    totalPage={WhiteBoardState.currentFile.pageCount}
                    currPage={WhiteBoardState.currentFile.currentPage}
                    onChange={this.onPageChange}
                  />
                </Tooltip>
              </div>
            )}
          {ChatroomState.type === 'owner' && (
            <div className="m-kit-wb-file">
              <Tooltip title="打开文档库" className="m-kit-wb-file-item">
                <i
                  className="u-icon iconfont u-file-icon"
                  onClick={this.openFileKit}
                >
                  文档库
                </i>
              </Tooltip>
              {WhiteBoardState.currentFile && (
                <Tooltip title="停止使用文档" className="m-kit-wb-file-item">
                  <i
                    className="u-icon iconfont u-file-icon"
                    onClick={this.resetFileKit}
                  >
                    关闭文档
                  </i>
                </Tooltip>
              )}
            </div>
          )}
        </Row>
      )
    );
  }
}
