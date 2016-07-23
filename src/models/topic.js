import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  img: { type: String },
  top: { type: Boolean, default: false }, // 置顶帖
  collects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 关注
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  docs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],  
  active: { type: Boolean, default: true },
});

class TopicModel { }

TopicSchema.plugin(loadClass, TopicModel);
TopicSchema.plugin(baseModel);
TopicSchema.plugin(mongoosePaginate);
TopicSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

TopicSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.numberOfVideos = ret.videos.length;
    ret.numberOfArticles = ret.articles.length;
    ret.numberOfCollects = ret.collects.length;
    delete ret.videos;
    delete ret.articles;
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});
export const Topic = mongoose.model('Topic', TopicSchema);
