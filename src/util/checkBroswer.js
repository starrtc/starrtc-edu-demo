/*

 * 浏览器音视频兼容性检查
 */
import Alert from './alert'
 
export default function({ success, fail }) {
  check()
    .then(() => {
      success && success();
    })
    .catch(() => {
      Alert.open({
        className: "u-alert-1",
        title: "提示",
        msg:
          '<div class="u-check-compatibility"><i class="u-icon-tip"></i><div class="tip-content"><div class="c1">当前浏览器不支持WebRTC，无法正常使用白板互动功能。</div><div class="c2">白板功能中的音频功能需要WebRTC的支持，请使用最新版Chrome浏览器。</div><div class="c3">下载最新Chrome浏览器，重新打开网页即可。</div></div></div>',
        isHtml: true,
        btns: [
          {
            label: "下载最新Chrome",
            clsName: "u-btn-longer f-h-26 f-mgr-10",
            onClick: () => {
              window.open("https://www.baidu.com/s?wd=chrome");
            }
          },
          {
            label: "仍要体验",
            clsName: "u-btn-cancle",
            onClick: () => {
              Alert.close();
              fail && fail();
            }
          }
        ],
        close: () => {
          console.log("【兼容浏览器】 --> X");
          Alert.close();
        }
      });
    });
}

function check() {

  return Promise.resolve();
}

window.test = function() {
  Alert.open({
    className: "u-alert-1",
    title: "提示",
    msg:
      '<div class="u-check-compatibility"><i class="u-icon-tip"></i><div class="tip-content"><div class="c1">当前浏览器不支持WebRTC，无法正常使用白板互动功能。</div><div class="c2">白板功能中的音频功能需要WebRTC的支持，请使用最新版Chrome浏览器。</div><div class="c3">下载最新Chrome浏览器，重新打开网页即可。</div></div>',
    isHtml: true,
    btns: [
      {
        label: "下载最新Chrome",
        clsName: "u-btn-longer f-h-26 f-mgr-10",
        onClick: () => {
          Alert.close();
          window.open("https://www.baidu.com/s?wd=chrome");
        }
      },
      {
        label: "仍要体验",
        clsName: "u-btn-cancle",
        onClick: () => {
          Alert.close();
        }
      }
    ],
    close: () => {
      console.log("【兼容浏览器】 --> X");
      Alert.close();
    }
  });
};
