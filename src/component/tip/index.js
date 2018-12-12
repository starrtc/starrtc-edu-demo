/*

 * 长条的tip
 */

import React, { Component } from 'react';
import classNames from 'classnames';

import { Row, Col } from '../../component';
import TipBase from '../tip-base';

import { Valid } from 'util';

const defaultProps = {
  message: null,
  visible: false
};

export default class extends Component {
  count = 0;
  state = defaultProps;

  componentWillMount() {
    // console.log('tip componentWillMount', this.props);
    const tmp = Object.assign({}, this.props, { visible: true });
    this.setState(tmp);
  }

  componentDidMount() {
    console.log('tip componentDidMount', this.state);
    this.checkTimer();
  }

  componentWillReceiveProps(props) {
    if (this.count) return;
    // console.log('tip componentWillReceiveProps', props);
    const tmp = Object.assign({}, props);
    this.setState(props);
  }

  shouldComponentUpdate() {
    return !this.count;
  }

  onClick(inEvent) {
    const { onClick } = inEvent;
    this.hide();
    Valid.isFunction(onClick) && onClick(inEvent);
  }

  checkTimer() {
    let { time } = this.state;
    let onClose = this.props.onClose;
    if (!time) return;
    time = +time;
    setTimeout(() => {
      this.hide();
      onClose && onClose();
    }, +time * 1000);
  }

  hide() {
    console.log('tip hide', this.state);
    this.setState({ visible: false });
    setTimeout(() => (this.count = 1), 300);
    // this.count = 1;
    return this;
  }

  render() {
    // console.log('tip render', this.state);
    const { className, message, close, visible } = this.state;
    const tmp = this.state;
    tmp.onClick = this.onClick.bind(this, { onClick: close });
    return visible && <TipBase {...tmp} />;
  }
}
