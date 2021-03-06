import _ from 'lodash';
import bcrypt from 'bcrypt-nodejs';
import moment from 'moment';

// 格式化时间
exports.formatDate = function formatDate(date, friendly) {
  const momentDate = moment(date);

  if (friendly) {
    return momentDate.fromNow();
  } else {
    return momentDate.format('YYYY-MM-DD HH:mm');
  }
};

// 生成随机字符串
exports.randomString = function randomString(len) {
  const length = len || 12;
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /* ***默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  const maxPos = $chars.length;
  let pwd = '';
  for (let index = 0; index < length; index++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

// 从markdown中提取图片
exports.extractImage = function extractImage(content) {
  const results = [];
  const images = content.match(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g);
  if (_.isArray(images) && images.length > 0) {
    for (let index = 0, len = images.length; index < len; index++) {
      const url = images[index].replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/, function($1, m1, m2, m3, m4) {
        return m4 || '';
      });
      if (url !== '') {
        results.push({url: url});
      }
    }
  }
  return results;
};

// 随机获取min-max之间的一个值
exports.getRandomNum = function getRandomNum(min, max) {
  const range = max - min;
  return (min + Math.floor(Math.random() * range));
};


// 从一个数组中随机获取num个元素
exports.getRandomFromArr = function getRandomFromArr(arr, num) {
  let length = arr.length;
  let tmp;
  let index;
  const result = [];
  while (length && result.length < num) {
    index = Math.floor(Math.random() * length--);
    tmp = arr[length];
    arr[length] = arr[index];
    arr[index] = tmp;
    result.push(arr[length]);
  }
  return result;
};

exports.bhash = function bhash(str, callback) {
  bcrypt.hash(str, null, null, callback);
};

exports.bcompare = function bcompare(str, hash, callback) {
  bcrypt.compare(str, hash, callback);
};
