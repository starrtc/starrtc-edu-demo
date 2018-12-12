/*

 * 网格布局组件
 */

import React, { Component } from 'react';
import classNames from 'classnames';

export default class extends Component {
  render() {
    const { children, className, span, onClick, spacing = false } = this.props;
    return (
      <div
        className={classNames(
          'u-grid-col',
          className,
          `flex-${span || 12}`,
          `${spacing ? 'spacing' : ''}`
        )}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }
}
