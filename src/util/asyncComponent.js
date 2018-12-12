/*

 * 异步加载组件的包装方法
 * 参考来源: https://scotch.io/tutorials/lazy-loading-routes-in-react
 */

import React, { Component } from 'react';

import Loading from '../module/loading';
import Page from './page';

export default function asyncComponent(getComponent) {
  class AsyncComponent extends Component {
    static Component = null;
    state = { Component: AsyncComponent.Component };

    componentWillMount() {
      if (!this.state.Component) {
        getComponent().then(Component => {
          // console.log('asyncComponent', Component);
          AsyncComponent.Component = Component;
          this.setState({ Component });
        });
      }
    }
    componentWillUpdate(props) {
      // console.log('componentWillUpdate props', props);
    }
    render() {
      const { Component } = this.state;
      if (Component) {
        Page.done();
        return <Component {...this.props} />;
      }
      return <Loading body="加载中，请稍等..." />;
    }
  }
  return AsyncComponent;
}
