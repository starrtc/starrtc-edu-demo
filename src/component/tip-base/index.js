/*

 * 长条的tip- base
 */

import React, { Component } from 'react';
import classNames from 'classnames';

import { Row, Col } from '../../component';

export default class extends Component {
  render() {
    // console.log('tip base render', this.props);
    const { className, message, close, onClick } = this.props;
    return (
      <div className="u-tip">
          <div className="u-tip-message">
            {message}
            {close && (
              <div className="close" onClick={onClick}></div> 
            )}
          </div>
      </div>
    );
  }
}
