/*

 * toast 消息提示组件
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { Row, Col } from '../../component';
import TipBase from '../tip-base';

import { AppendToDom, Valid } from '../../util';

const defaultProps = {
  hidden: true
};

export default class extends Component {
  static newInstance(inProps = {}) {
    // console.log('newInstance', inProps);
    inProps = Object.assign(inProps, {
      className: 'u-toast'
    });
    return AppendToDom(this, inProps, null);
  }

  static defaultProps = defaultProps;
  state = defaultProps;

  show(inProps) {
    const { visible } = this.state;
    const newProps = Object.assign(
      this.state,
      this.props,
      { hidden: false, visible: true },
      inProps
    );
    // console.log('toast visible', visible, newProps);
    this.setState(newProps);
    return this;
  }

  hide = () => {
    const { visible } = this.state;
    console.log('toast hide', visible, this.state);
    this.setState({ visible: false });
    return this;
  };

  onClick = inEvent => {
    // console.log('_onItemClick', inEvent)
    const { onClick } = inEvent;
    this.hide();
    Valid.isFunction(onClick) && onClick(inEvent);
  };

  render() {
    // console.log('toast this.state', this.state);
    const { className, message, close } = this.state;
    const tmp = this.state;
    tmp.onClick = this.onClick.bind(this, { onClick: close });
    return (
      <div hidden={!this.state.visible}>
        <TipBase {...this.state} />
      </div>
    );
  }
}
