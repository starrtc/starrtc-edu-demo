/*

 * 网格布局组件
 */

import React, { Component } from 'react';
import classNames from 'classnames';

export default class extends Component {
  render() {
    const {
      children,
      className,
      title,
      option,
      onClick,
      spacing = false
    } = this.props;
    return (
      <div
        className={classNames(
          'u-grid-row',
          className,
          `${spacing ? 'spacing' : ''}`
        )}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }
}
