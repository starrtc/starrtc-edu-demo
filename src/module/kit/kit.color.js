/*

 * 白板工具栏颜色组件
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import classNames from 'classnames';
import { Row, Col, Tooltip, Pagination } from '../../component';
import EXT_WHITEBOARD from '../../ext/whiteboard';

import { StoreWhiteBoard, StoreNetcall, StoreChatroom } from '../../store';

const NetcallState = StoreNetcall.state;
const ChatroomState = StoreChatroom.state;
const WhiteBoardState = StoreWhiteBoard.state;

@observer
export default class extends Component {
  setColor(color) {
    EXT_WHITEBOARD.setColor(color);
  }
  render() {
    return (
      <div className="m-kit m-kit-color">
        <Col span={6}>
          {WhiteBoardState.colorList.map((item, index) => (
            <i
              key={index}
              className={`u-icon u-icon-color ${WhiteBoardState.currentDrawColor === item ? 'active' : ''}`}
              style={{ backgroundColor: item }}
              onClick={() => this.setColor(item)}
            />
          ))}
        </Col>
      </div>
    );
  }
}
