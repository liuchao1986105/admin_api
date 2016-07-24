import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

// 计算一篇文章的热门值
export const Scores = {
  comment: 3,
  collect: 2,
  visit: 1,
};

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  imgs: { type: Array },
  top: { type: Boolean, default: false },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  visitCount: { type: Number, default: 0 },
  collectCount: { type: Number, default: 0 },
  lastReplyAt: { type: Date},
  url: { type: String },
  type: { type: String },  // doc video
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], // 一篇文章可以有多个标签
  isCollected: { type: Boolean },
  active: { type: Boolean, default: true },
});

class ArticleModel { 
  get score() {
    return this.comments.length * Scores.comment + this.visitCount * Scores.visit + this.collectCount * Scores.collect ;
  }
}

ArticleSchema.plugin(loadClass, ArticleModel);
ArticleSchema.plugin(baseModel);
ArticleSchema.plugin(mongoosePaginate);
ArticleSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

ArticleSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.score = doc.score;
    delete ret.comments;
    delete ret.__v;
    delete ret.lastReplyAt;
    delete ret.type;
    delete ret.imgs;
    return ret;
  },
});
// export const Article = mongoose.model('Article', ArticleSchema);
