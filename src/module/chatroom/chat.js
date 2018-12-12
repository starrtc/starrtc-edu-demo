/*

 * 聊天室聊天区
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import classNames from 'classnames';

import { Row, Col } from '../../component';

import List from './chat.list';
import ChatInput from './chat.input';

@observer
export default class extends Component {
  render() {
    return (
      <div className="m-chatroom-chatarea">
        <List />
        <ChatInput />
      </div>
    );
  }
}
