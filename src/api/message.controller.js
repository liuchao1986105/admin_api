import Promise from 'bluebird';
import { Message } from '../models/message';
import { swallow } from '../utils/decorators';
import validator from 'validator';

export default class MessageController {
  @swallow
  static async getUserMessges(req, res, next){
    const unReadMsgs = await Message.findAsync({
      masterId: req.user._id,
      hasRead: false,
      active: true,
    }, null, {
      // skip: 0, // Starting Row
      // limit: 10, // Ending Row
      // select: 'type created_at',
      sort: {
        created_at: -1,
      },
    }).populate([
      {path: 'articleId', model: 'Article', select: '_id title visitCount collectCount'},
    ]).exec();
    await MessageController._updateMessagesToRead(req.user._id, unReadMsgs);
    return res.json({success: true, data: unReadMsgs});
  }

  @swallow
  static async getMessgesCount(req, res, next) {
    const count = Message.countAsync({masterId: req.user._id, hasRead: false});
    return res.json({success: true, count: count});
  }

  static _updateMessagesToRead(userId, unReadMsgs) {
    if (unReadMsgs.length === 0) {
      return;
    }

    const ids = unReadMsgs.map((msg) => {
      return msg._id;
    });

    const query = { masterId: userId, _id: { $in: ids } };
    return Message.updateAsync(query, { $set: { hasRead: true } }, { multi: true });
  }
}
