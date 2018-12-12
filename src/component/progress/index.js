/*

 * 进度条展示组件
 * <Progress percent={percent} visible={visible}/>
 */
import React, { Component } from 'react';
import classNames from 'classnames';

export default function(props) {
  // console.log(props)
  const { children, className, percent, visible } = props;
  return (
    visible && (
      <div className={classNames('u-progress', className)}>
        <p
          className={classNames('u-progress-state')}
          style={{ width: `${percent}%` }}
        />
      </div>
    )
  );
}
