/*

 * 默认配置项导出
 */

import { Storage } from 'util';

export default {
  
  wbInfo: {
    colorList: ['#efa700', '#28cf30', '#2d48a1', '#df23df', '#d63232', '#000'],
    color: '#000',
    styleList: ['line', 'rect', 'circle'],
    style: 'free'
  },
  serializeFileStateMap: {
    // uploading
    UNKNOWN: '0',
    // transfering
    PRETRANS: '1',
    // upload fail
    TRANSING: '2',
    // transfer fail
    TRANSTIMEOUT: '3',
    TRANSCOMPLETE: '4',
    // upload + transfer done
    TRANSFAIL: '5',
    UPLOADING: '11',
    UPLOADDONE: '12',
    UPLOADFAIL: '13'
  },
  unserializeFileStateMap: {
    // uploading
    '0': 'UNKNOWN',
    // transfering
    '1': 'PRETRANS',
    // upload fail
    '2': 'TRANSING',
    // transfer fail
    '3': 'TRANSTIMEOUT',
    '4': 'TRANSCOMPLETE',
    // upload + transfer done
    '5': 'TRANSFAIL',
    '11': 'UPLOADING',
    '12': 'UPLOADDONE',
    '13': 'UPLOADFAIL'
  },
  // 文档转码状态,1表示转码准备中，2表示转码中，3表示转码超时，4表示转码成功，5表示转码失败，0表示未知状态
  unserializeFileStateText: {
    0: '状态未知',
    // 转码准备中
    1: '转码准备中',
    // transfering
    2: '转码中',
    // upload fail
    3: '转码超时',
    // transfer fail
    4: '转码成功',
    // upload + transfer done
    5: '转码失败',
    11: '上传中',
    12: '上传完成',
    13: '上传失败'
  },
  serializefileTypeMap: {
    1: 'ppt',
    2: 'pptx',
    3: 'pdf'
  },
  // 限制的文档类型数字
  unserializefileTypeMap: {
    ppt: 1,
    pptx: 2,
    pdf: 3
  },
  // 转码的图片类型
  fileTypeMap: {
    10: 'jpg',
    11: 'png',
    0: 'unknown'
  }
};
