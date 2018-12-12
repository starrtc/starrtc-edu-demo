import React, { Component } from "react";
import classNames from "classnames";
import { observer } from "mobx-react";

@observer
export default class extends Component {
  onToggleAudio = e => {

  };

  onToggleVideo = e => {

  };

  render() {
    return (
      <div className="u-confirm-device">
        <div className="msg">
          <div>老师已通过你的发言方式，</div>
          <div>请选择发言方式:</div>
        </div>
        <div className="fnlist">
          <div className="fn-part">
            <input
              type="checkbox"
              name="fn"
              id="audio"
              className="select-checkbox"
            />
            <label
              className={classNames(
                "select-item",
				""
              )}
              htmlFor="audio"
              onClick={this.onToggleAudio}
            >
              语音
            </label>
          </div>
          <div className="fn-part">
            <input
              type="checkbox"
              name="fn"
              id="video"
              className="select-checkbox"
            />
            <label
              className={classNames(
                "select-item",
				""
              )}
              htmlFor="video"
              onClick={this.onToggleVideo}
            >
              视频
            </label>
          </div>
          <div className="fn-part fn-part-1">
            <input
              type="checkbox"
              name="fn"
              id="whiteboard"
              className="select-checkbox"
            />
            <label className="select-item disabled" htmlFor="whiteboard">
              默认互动白板
            </label>
          </div>
        </div>
      </div>
    );
  }
}
