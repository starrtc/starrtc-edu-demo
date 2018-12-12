/*

 * 异步请求api
 */

import env from '../env';

const headerMap = {
  json: 'application/json;charset=UTF-8',
  form: 'application/x-www-form-urlencoded'
};
const getFormData = data =>
  Object.keys(data)
    .map(
      key =>
        encodeURIComponent(key) +
        '=' +
        encodeURIComponent(
          /Object/i.test(data[key]) ? JSON.stringify(data[key]) : data[key]
        )
    )
    .join('&');

/**
 * 异步请求方法
 *
 * @param {any} option
 * @param {string} [option.type=get] 请求方式: GET / POST
 * @param {string} [option.dataType=json] 数据传递方式: json / 其他
 * @param {string} option.url 请求地址
 * @param {data} option.data 请求数据
 */
export default function(option) {
  if (!option.url || !option.data) {
    return Promise.reject('参数不完整，无法发起请求');
  }

  option.dataType = option.dataType || 'json';
  option.dataType = option.dataType.toLowerCase();

  var xhr = new XMLHttpRequest();
  xhr.timeout = 20 * 1000;
  xhr.open(option.type || 'GET', option.url, true);
  xhr.responseType = `${option.dataType}`;

  xhr.setRequestHeader('Content-type', headerMap[option.dataType]);

  const header = xhr.setRequestHeader('appkey', env.appkey);

  return new Promise((resolve, reject) => {
    xhr.onload = function() {
      var data = xhr.response;
      if (option.dataType === 'form') {
        data = JSON.parse(data);
      }
      resolve(data);
    };
    xhr.onerror = function(e) {
      console.error('xhr error', e);
      reject('请求错误，请重试');
    };
    xhr.ontimeout = function(e) {
      console.error('xhr timeout', e);
      reject('请求超时，请重试');
    };

    if (option.dataType === 'json') {
      xhr.send(JSON.stringify(option.data));
    } else if (option.dataType === 'form') {
      xhr.send(getFormData(option.data));
    }
  });
}
