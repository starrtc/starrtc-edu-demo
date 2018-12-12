/*

 * 分页组件，只提供分页组件的页码外显和回调功能
 */

import React, { Component } from 'react';
export default class extends Component {
  id = null
  state = {
    totalPage: 0,
    currPage: 0
  };
  componentWillMount() {
    // console.log('componentWillMount', this.props);
    this.setNewState(this.props);
  }
  componentWillReceiveProps(nextProps) {
    // console.log('componentWillReceiveProps', nextProps);
    this.setNewState(nextProps);
  }
  setNewState(props) {
    const id = this.id;
    if (id === props.id) return;
    this.setState({
      totalPage: +props.totalPage,
      currPage: +props.currPage
    });
  }
  goPrev = e => {
    const state = this.state;
    if (state.currPage <= 1) return;
    const n = state.currPage - 1;
    this.setPage(n);
  };
  goNext = e => {
    const state = this.state;
    if (state.currPage >= state.totalPage) return;
    const n = state.currPage + 1;
    this.setPage(n);
  };
  setPage(n) {
    console.log('setPage', n);
    this.setState({ currPage: n });
    this.props.onChange && this.props.onChange(n);
  }
  render() {
    const { totalPage, currPage } = this.state;
    return (
      <div>
        <div className="u-pagination">
          <a
            className={`u-icon iconfont icon-back ${
              currPage <= 1 ? 'disable' : ''
            }`}
            onClick={this.goPrev}
          />
          <span className="u-pagination-text">
            {currPage} / {totalPage}
          </span>
          <a
            className={`u-icon iconfont icon-more ${
              currPage >= totalPage ? 'disable' : ''
            }`}
            onClick={this.goNext}
          />
        </div>
      </div>
    );
  }
}
