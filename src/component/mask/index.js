/*

 * 遮罩组件
 */

import React, { Component } from 'react';
import classNames from 'classnames';

export default class extends Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;
    if (visible) {
      this.setState({ hidden: !nextProps.visible });
    }
  }

  render() {
    //   console.log('mask props', this.props)
    const { visible, className, ...props } = this.props;
    return (
      <div
        hidden={!visible}
        className={classNames('u-mask', className)}
        {...props}
      />
    );
  }
}
