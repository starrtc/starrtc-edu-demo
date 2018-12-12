/*

 * 文本框框的样式
 */

import React, { Component } from 'react';
import classNames from 'classnames';

export default class extends Component {
  render() {
    const { children, className, onChange, onBlur, onKeyDown, placeholder,value } = this.props;
    return (
      <textarea
        className={classNames('u-textarea', className)}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        value={value}
      >
      </textarea>
    );
  }
}
