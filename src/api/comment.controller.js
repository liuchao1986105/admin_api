import Promise from 'bluebird';
import { Comment } from '../models/comment';
import { Article } from '../models/article';
import { User, Values } from '../models/user';
import { swallow } from '../utils/decorators';
import message from '../utils/message';
import validator from 'validator';


export default class CommentController {
  @swallow
  static async postComments(req, res, next) {
    const content = validator.escape(validator.trim(req.body.content));

    let error;
    if (!content) {
      error = '评论内容不能为空';
    }
    if (error) {
      return res.status(422).send({success: false, error: error});
    }

    const newComment = new Comment();
    newComment.content = content;
    newComment.authorId = req.user._id;
    const comment = await newComment.saveAsync();

    // 要往article里的comments插数据
    const article = await Article.findById(req.params.article_id).populate('authorId').exec();
    article.comments.addToSet(comment);
    await article.saveAsync();

    await User.findByIdAndUpdateAsync(req.user._id, {$inc: {score: Values.comment}});

    // 推送消息
    global.logger.debug(article.authorId._id.toString());
    global.logger.debug(req.user._id.toString());
    if ( article.authorId._id.toString() !== req.user._id.toString()) {
      message.sendMessage(article.authorId._id, req.user._id, article._id, comment._id, 'article', 'comment');
    }
    // @
    const newContent = content.replace('@' + article.authorId.name + ' ', '');
    message.sendMessageToMentionUsers(newContent, req.user._id, article._id, comment._id, 'article', 'comment');
    return res.status(200).json({success: true, commentId: comment._id});
  }

  @swallow
  static async getComments(req, res, next) {
    const comments = await Comment.findAsync({
      articleId: req.params.article_id,
      active: true,
    }, null, {
      // skip: 0, // Starting Row
      // limit: 10, // Ending Row
      // select: 'type created_at',
      sort: {
        created_at: -1,
      },
    }).populate([
      {path: 'authorId', model: 'User', select: '_id name description headimgurl'},
    ]).exec();
    return res.status(200).json({success: true, comments: comments});
  }

  @swallow
  static async updateComment(req, res, next) {
    const content = validator.escape(validator.trim(req.body.content));
    let error;
    if (!content) {
      error = '评论内容不能为空';
    }
    if (error) {
      return res.status(422).send({success: false, error: error});
    }

    const comment = await Comment.findByIdAsync(req.params.comment_id);
    comment.content = content;
    await comment.saveAsync();
    return res.status(200).send({success: true, comment_id: comment._id});
  }

  static deleteComment(req, res, next) {
    Article.findOneAndUpdate({_id: req.params.article_id}, {$pull: {comments: req.params.comment_id}})
    .exec().then((article) => {
      return Comment.findByIdAndUpdate(req.params.comment_id, {active: false}).exec();
    }).then((comment) => {
      res.json({success: true, data: 'deleted'});
    }).catch(next);
  }

  @swallow
  static async postReply(req, res, next) {
    const commentId = req.params.comment_id;
    const content = validator.escape(validator.trim(req.body.content));
    if (!content) {
      return res.status(422).send({success: false, data: '回复内容不能为空'});
    }

    await User.findByIdAndUpdateAsync(req.user._id, {$inc: {score: Values.comment}});
    
    const reply = {
      content: content,
      user_info: {
        id: req.user._id,
        name: req.user.name,
        headimgurl: req.user.headimgurl,
      },
      created: new Date(),
    };

    const comment = await Comment.findByIdAndUpdate(commentId, {$push: {replys: reply}}, {new: true}).populate('authorId').exec();
    message.sendMessage(comment.authorId, req.user._id, article._id, comment._id, 'article', 'reply');


    // @
    const newContent = content.replace(/^@\w+\s/, '');
    global.logger.debug(`newContent:$newContent`);
    message.sendMessageToMentionUsers(newContent, req.user._id, article._id, comment._id, 'article', 'reply');
    return res.status(200).json({success: true, data: comment.replys});
  }

  static delReply(req, res, next) {
    const commentId = req.params.comment_id;
    const replyId = req.params.reply_id;

    Comment.findByIdAndUpdateAsync(commentId, {$pull: {replys: { _id: replyId}}}, {new:true}).then(function(result) {
      return res.status(200).json({success: true, data: result});
    }).catch(function (err) {
      return res.status(500).json({success: false, data: err});
    });
  }

}
