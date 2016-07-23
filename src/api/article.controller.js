import Promise from 'bluebird';
import { Topic } from '../models/topic';
import { Comment } from '../models/comment';
import { Article } from '../models/article';
import { User, Values } from '../models/user';
import { swallow } from '../utils/decorators';
import cache from '../utils/cache';
import tools from '../utils/tools';
import config from '../config/env';
import validator from 'validator';
import _ from 'lodash';
import MarkdownIt from 'markdown-it';

export default class ArticleController {
  @swallow
  static async postArticles(req, res, next){
    const topic = await Topic.findByIdAsync(req.params.topic_id);
    const title = validator.escape(validator.trim(req.body.title));

    let error_msg;
    if (!title) {
      error_msg = '标题不能为空.';
    }
    if (!req.body.description) {
      error_msg = '内容不能为空.';
    }
    if (error_msg) {
      return res.status(422).send({success: false, error: error_msg});
    }

    // 将图片提取存入images,缩略图调用
    // const imgs = tools.extractImage(content);
    const articles = [];
    articles.unshift(new Article({
      title: title,
      description: req.body.description,
      topicId: topic._id,
      // imgs: ['http://image12333'],
      authorId: req.user._id,
      url: req.body.url,
      type: req.body.type,
      tags: ['576fe44fbb49a7b7a5e606b9'],
    }));

    // Article.createAsync(req.body);

    await Promise.map(articles, (article) => {return article.saveAsync();});
    const pushCondition = (req.body.type === 'video') ? { videos: { $each: articles, $position: 0, }} : { docs: { $each: articles, $position: 0, }};
    await Topic.update(
      {_id: req.params.topic_id},
      {
        $push: pushCondition,
      }).exec();
    await User.findByIdAndUpdateAsync(req.user._id, {$inc: {score: Values.article}});
    cache.del(`articles:latest:1`);  // 新发布一篇文章会影响最新动态
    cache.del(`topic:${topic._id}:articles:${req.body.type}:1`)

    return res.json({success: true, article_id: articles[0]._id});
  }

  static async getTopicArticles(req, res, next) {
    const page = parseInt(req.query.page, 10) || 1;
    const topicId = req.params.topic_id;
    let condition = {
      topicId: req.params.topic_id,
      active: true,
      type: req.query.type,
    }

    if(req.query.tag_id){
      //tagId = new mongoose.Types.ObjectId(tagId);

      const tag_id = String(req.query.tag_id);
      // condition = _.defaults({ condition, tags: { $elemMatch: { $eq:tag_id } } });
      condition = { condition, tags: { $elemMatch: { $eq:tag_id } } };
    }

    let result = await cache.get(`topic:${topicId}:articles:${req.query.type}:${page}`);
    if ( !result ) {
      result = await Article.paginate(condition, {
        populate: [
          {path: 'authorId', model: 'User', select: '_id name description headimgurl'},
        ],
        page: page,
        limit: Number(req.query.limit) || 10,
        sort: {
          top: -1,
          score: -1,
          created_at: -1,
        },
      });
      if (page === 1) {
        cache.set(`topic:${topicId}:articles:${req.query.type}:${page}`, result);
      }
    }
    
    res.json({
      success: true,
      data: {
        pageCount: result.pages,
        articles: result.docs,
      },
    });
  }

  @swallow
  static async putCollect(req, res, next) {
    const user = req.user;
    const article = await Article.findByIdAndUpdateAsync(req.params.article_id, {$inc: {collectCount: 1}});
    // user.collectedArticles.unshift(article);
    // await user.saveAsync();

    //     {'$pull':{'likeList':aid}};
    // {'$addToSet':{'likeList':aid}};
    await User.update(
      {_id: user._id},
      {
        $push: {collectedArticles: {$each: [article], $position: 0,}},
        $inc: {score: Values.collect},
      }).exec();
    message.sendMessage(article.authorId, user._id, article._id, null, 'article', 'collect');
    return res.json({success: true, data: 'collected'});
  }

  @swallow
  static async putTop(req, res, next) {
    await Article.updateAsync({_id: req.params.article_id}, { $set: { top: true } }, { multi: true });
    cache.del('articles:top:1');
    return res.json({success: true, data: 'toped'});
  }

  @swallow
  static async getArticle(req, res, next) {
    let article = await cache.get(`article:${req.params.article_id}`);
    const md = new MarkdownIt({
      html:true,  // 启用html标记转换
    });
    if ( !article ) {
      article = await Article.findByIdAndUpdate(req.params.article_id, {$inc: {visitCount: 1}}).populate([
        {path: 'authorId', model: 'User', select: '_id name description headimgurl'},
        {path: 'tags', model: 'Tag', select: '_id name'},
      ]).exec();
      /* article = await Article.populateAsync(article, [
        {path: 'authorId', model: 'User', select: '_id name description headimgurl'},
        {path: 'comments.authorId', model: 'User', select: '_id name'},
      ]); */
      cache.set(`article:${req.params.article_id}`, article);
    }

    // 要判断用户是否收藏了这个article
    if (req.query.user_id) {
      const user = await User.findOneAsync({_id: req.query.user_id, collectedArticles: {$all: [req.params.article_id]}});

      article.isCollected = user ? true : false;
    }
    // description markdown文档转成HTML
    article.description = md.render(article.description);

    return res.json({success: true, article: article});
  }

  @swallow 
  static async updateArticle(req, res, next) {
    const title = validator.escape(validator.trim(req.body.title));

    let error_msg;
    if (!title) {
      error_msg = '标题不能为空.';
    }
    if (!req.body.description) {
      error_msg = '内容不能为空.';
    }
    if (error_msg) {
      return res.status(422).send({success: false, error: error_msg});
    }

    let article = await Article.findByIdAsync(req.params.article_id);
    article.title = title;
    article.description = req.body.description;
    article.url = req.body.url;
    article.type = req.body.type;
    article.tags = ['576fe44fbb49a7b7a5e606b9'];
    // 将图片提取存入images,缩略图调用
    // article.imgs = tools.extractImage(req.body.description);
    article = await article.saveAsync();
    // Article.findByIdAndUpdateAsync(id,req.body,{new:true});
    await cache.set(`article:${req.params.article_id}`, article);
    return res.json({success: true, article_id: article._id});
  }

  @swallow
  static async deleteArticle(req, res, next) {
    let article = await Article.findByIdAsync(req.params.article_id);
    article.active = false;
    article = await article.saveAsync();

    // 删除文章的评论
    // Comment.removeAsync({articleId:article._id});
    cache.set(`article:${req.params.article_id}`, article);
    return res.json({success: true, article: article});
  }

  @swallow
  static async getArticles(req, res, next){
    const page = parseInt(req.query.page, 10) || 1;
    let query = {active: true,};
    let sort = {};
    let docs;
    if (req.query.type === 'top') {
      query.top = true;
      sort = { created_at: -1, };
    } else if (req.query.type === 'hot') {
      sort = { score: -1, created_at: -1, };
    } else if (req.query.type === 'latest') {
      sort = { created_at: -1, };
    }

    let result = await cache.get(`articles:${req.query.type}:${page}`);
    // if ( Object.keys(result).length < 1  || !result ) {
    if ( !result ) {
      result = await Article.paginate(query,
      {
        populate: [
          {path: 'authorId', model: 'User', select: '_id name description headimgurl'},
        ],
        page: page,
        limit: Number(req.query.limit) || 10,
        sort: sort,
      });
      if (page === 1) {
        if (req.query.type === 'hot') {
          cache.set(`articles:${req.query.type}:${page}`, result, config.cachetime);
        }
        cache.set(`articles:${req.query.type}:${page}`, result);
      }
    }

    res.json({
      success: true,
      data: {
        pageCount: result.pages,
        articles: result.docs,
      },
    });
  }

}

