import React, { Component } from "react";
import classNames from "classnames";
import renderHTML from "react-render-html";

import { Button } from "../../component";
import { AppendToDom } from "../../util";

const defaultProp = {
  className: "",
  title: "提示",
  msg: "",
  btns: [],
  close: null,
  isHtml: false
};

export default class extends Component {
  static newInstance(inProps = {}) {
    return AppendToDom(this, inProps, null);
  }
  state = {
    visible: false
  };
  show(inProps) {
    const newProps = Object.assign(
      this.state,
      {
        visible: true
      },
      inProps
    );
    console.log("弹窗新属性: ", newProps);
    this.setState(newProps);
    return this;
  }
  hide = () => {
    this.setState({
      visible: false
    });
    return this;
  };
  btnClick = e => {
    console.log("btn click=>", e);
    const { onClick } = e;

    //触发按钮注册的点击事件处理器
    onClick(e);
  };

  render() {
    const { className, title, msg, btns = [], close, isHtml } = this.state;
    return (
      <div className="u-alert-wrapper" hidden={!this.state.visible}>
        <div className="u-mask" />
        <div className={classNames("u-alert", className)}>
          <div className="alert-header">
            <div className="title">{title ? title : "提示"}</div>
            <div
              className="close"
              onClick={() => {
                close ? close() : this.hide();
              }}
            />
          </div>
          <div className="alert-body">{isHtml ? renderHTML(msg) : msg}</div>
          {btns &&
            btns.length > 0 && (
              <div className="alert-footer">
                {btns.map((item, index) => {
                  return (
                    <Button
                      key={index}
                      className={item.clsName}
                      onClick={() => this.btnClick(item)}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    );
  }
}
