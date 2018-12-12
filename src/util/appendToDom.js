/*

 * react 将组件挂载到指定dom上
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import ReactDOM from 'react-dom';

export default function(InComponent, inProps, el, cb) {
  const props = inProps || {};
  const body = el || document.body;
  let div = document.createElement('div');

  body.appendChild(div);
  return ReactDOM.render(<InComponent {...props} />, div)

}
