/*

 * 白板工具栏组件: 左侧更多功能的工具栏
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { Row, Col, Icon } from '../../component';

import { StoreWhiteBoard } from '../../store';

const ActionWB = StoreWhiteBoard;
const StoreWB = StoreWhiteBoard.state;

@observer
export default class extends Component {
  styleClick = item => {
    ActionWB.setStyle(item);
  };
  render() {
    return (
      <Row className="m-kit m-kit-draw flex-v">
        <Col span={6}>
          <i className="u-icon u-icon-color" />
          <i className="u-icon u-icon-color" />
          <i className="u-icon u-icon-color" />
          <i className="u-icon u-icon-color" />
          <i className="u-icon u-icon-color" />
          <i className="u-icon u-icon-color" />
        </Col>
        <Col span={4}>
          {StoreWB.styleList.map((item, index) => (
            <Icon
              key={index}
              className={`u-icon u-icon-${item}`}
              active={item === StoreWB.style}
              onClick={() => this.styleClick(item)}
            />
          ))}
        </Col>
        <Col span={1}>
          <i className="u-icon u-icon-fill iconfont icon-shuru-tianchong" />
        </Col>
      </Row>
    );
  }
}
