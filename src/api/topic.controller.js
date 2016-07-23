import Promise from 'bluebird';
import { Topic } from '../models/topic';
import { User, Values } from '../models/user';
import { swallow } from '../utils/decorators';
import validator from 'validator';
import _ from 'lodash';

export default class TopicController {
  @swallow
  static async getTopic(req, res, next) {
    const topic = await Topic.findByIdAsync(req.params.topic_id);
    const data = topic ? { ...topic.toJSON() } : null;

    res.json({success: true, data: data});
  }

  @swallow
  static async addTopic(req, res, next) {
    const title = validator.escape(validator.trim(req.body.title));
    const description = validator.trim(req.body.description);
    // 添加标签
    const tags = ['576fe44fbb49a7b7a5e606b9'];

    let error;
    if(title === '') {
      error = '主题名不能为空';
    }
    if(error){
      return res.status(422).send({success: false, error: error});
    }

    const newTopic = new Topic();
    newTopic.title = title;
    newTopic.description = description;
    newTopic.tags = tags;

    const topic = await newTopic.saveAsync();
    return res.status(200).json({success:true, topicId: topic._id});
  }

  @swallow
  static async updateTopic(req, res, next){
    const title = validator.escape(validator.trim(req.body.title));
    const description = validator.trim(req.body.description);
    // 添加标签
    const tags = ['576fe44fbb49a7b7a5e606b9'];

    let error;
    if(title === '') {
      error = '主题名不能为空';
    }
    if(error){
      return res.status(422).send({success: false, error: error});
    }

    let topic = await Topic.findByIdAsync(req.params.topic_id);
    topic.title = title;
    topic.description = description;
    topic.tags = tags;
    await topic.saveAsync();
    return res.status(200).send({success: true, topic_id: topic._id});
  }

  @swallow
  static async deleteTopic(req, res, next) {
    const topic = await Topic.findByIdAsync(req.params.topic_id);
    topic.active = false;
    await topic.saveAsync();
    return res.status(200).send({success: true, data: 'delete success'});
  }

  @swallow
  static getTopics(req, res, next) {
    Topic.paginate({
      active: true,
    }, {
      page: parseInt(req.query.page, 10) || 1,
      limit: Number(req.query.limit) || 10,
      sort: {
        top: -1,
        created_at: -1,
      },
    }).then(({docs, pages}) => {
      res.json({
        success: true,
        data: {
          pageCount: pages,
          topics: docs,
        },
      });
    });
  }

  @swallow
  static async putCollect(req, res, next) {
    const user = req.user;
    const topic = await Topic.findOneAsync({_id: req.params.topic_id});
    if (_.findIndex(topic.collects,  user._id) !== -1) {
      return res.json({success: false, data: 'existed'});
    }
    topic.collects.addToSet(req.user);
    await topic.saveAsync();

    await User.update(
      {_id: req.user._id},
      {
        $push: {collectedTopics: {$each: [topic], $position: 0,}},
        $inc: {score: Values.collect},
      }).exec();

    return res.json({success: true, data: 'collected'});
  }

}
