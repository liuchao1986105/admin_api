import Promise from 'bluebird';
import { Tag } from '../models/tag';
import { swallow } from '../utils/decorators';
import validator from 'validator';
import _ from 'lodash';

export default class TagController {
  @swallow
  static async addTag(req, res, next) {
    const name = validator.escape(validator.trim(req.body.name));

    let error;
    if(name === '') {
      error = '标签名称不能为空';
    }
    if(error){
      return res.status(422).send({success: false, error: error});
    }

    const tag = await Tag.findOneAsync({name:name});
    if (tag) {
      return res.status(403).send({success: false, error_msg:'标签名称已经存在.'});
    } else {
      req.body.name = name;
      const newTag = await Tag.createAsync(req.body);
      return res.status(200).json({ success: true, tag_id: newTag._id});
    }
  }

  @swallow
  static async updateTag(req, res, next){
    const name = validator.escape(validator.trim(req.body.name));

    let error;
    if(name === '') {
      error = '标签名称不能为空';
    }
    if(error){
      return res.status(422).send({success: false, error: error});
    }

    let tag = await Tag.findByIdAndUpdateAsync(req.params.tag_id, {$set: {name: name}});
    return res.status(200).send({success: true, tag_id: tag._id});
  }

  @swallow
  static async deleteTag(req, res, next) {
    let tag = await Tag.findByIdAndUpdateAsync(req.params.tag_id, {$set: {active: false}});
    return res.status(200).send({success: true, tag_id: tag._id});
  }

  @swallow
  static async getTags(req, res, next) {
    const tags = await Tag.findAsync({
      active: true,
    }, null, {
      // skip: 0, // Starting Row
      // limit: 10, // Ending Row
      // select: 'type created_at',
      sort: {
        sort: -1,
      },
    });
    return res.status(200).json({success: true, tags: tags});
  }
}
