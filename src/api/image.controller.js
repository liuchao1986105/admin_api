import Promise from 'bluebird';
import MarkdownIt from 'markdown-it';
import URL from 'url';
import { User } from '../models/user';
import { swallow } from '../utils/decorators';
import tools from '../utils/tools';
import config from '../config/env';
import validator from 'validator';
import qiniuHelper from '../utils/qiniu';
import _ from 'lodash';

export default class ImageController {
  static uploadImage(req, res, next) {
    const file = req.file;
    if (!file) {
      return res.status(422).send({success: false, msg: "缺少文件参数."});
    }
    const fileName =  new Date().getTime() + file.originalname;
    qiniuHelper.upload(file.path, 'article/' + fileName).then(function (result) {
      return res.status(200).json({success:true, img_url: result.url});
    }).catch(function (err) {
      return next(err);
    });
  }

  //将网络图片抓取到七牛
  /**
   * 七牛返回结果
   * $$hashKey: "object:88"
   * hash: "FmUJ7-RWKGMtsX8UTY-_oa5ahsFb"
   * key: "blog/article/1439948192797e48eb2b310f91bda45273dbbfc1a8e6e.png"
   * url: "http://upload.jackhu.top/blog/article/1439948192797e48eb2b310f91bda45273dbbfc1a8e6e.png"
   */
  static fetchImage(req, res, next) {
    if (!req.body.url) {
      return res.status(422).send({success: false, msg: "url地址不能为空."});
    }
    const urlLink = URL.parse(req.body.url);
    let fileName;
    if (urlLink.pathname.indexOf('/') !== -1) {
      const links = urlLink.pathname.split('/');
      fileName = links[links.length - 1];
    }else{
      fileName = urlLink.pathname;
    };

    fileName =  new Date().getTime() + fileName;
    qiniuHelper.fetch(req.body.url, 'article/' + fileName).then(function (result) {
      return res.status(200).json({success: true, img_url: result.url});
    }).catch(function (err) {
      return next(err);
    });
  }

  static getImage(req, res, next) {
    // 使用redis缓存图片列表.
    global.redis.llen('indexImages').then(function (imagesCount) {
      if (imagesCount < 1) {
        res.status(200).json({success: true, img: config.defaultImage});
        return qiniuHelper.list('theme', '', 30).then(function(result){
          return Promise.map(result.items, function(item) {
            return redis.lpush('indexImages', config.qnConfig.DOMAIN + item.key + '-600x1500q80');
          });
        });
      } else {
        return global.redis.lrange('indexImages', 0, 30).then(function(images) {
          const index = _.random(images.length - 1);
          return res.status(200).json({success: true, img: images[index]});
        });
      }
    }).catch(function(err) {
      global.redis.del('indexImages');
      return next(err);
    });
  }

}
