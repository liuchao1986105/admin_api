import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';
import crypto from 'crypto';

// 计算一个用户的积分
export const Values = {
  article: 5,
  comment: 3,
  collect: 2,
};

const UserSchema = new mongoose.Schema({
  username: { type: String,  required: true, index: true },
  password: {type: String, required: true},
  email: {type: String, lowercase: true, required: true},
/*  headimgurl: { type: String },
  sex: { type: String, default: '' },
  city: { type: String },
  province: { type: String },
  description: { type: String },
  phone: { type: String },
  provider: { type: String, default: 'local'},
  collectedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic'}],
  collectedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
  score: { type: Number, default: 0 },
  role: { type: String, default: 'user'},*/
  salt: { type: String },
  active: { type: Boolean, default: true },
/*  github: {
    id: String,
    token: String,
    email: String,
    name: String,
  },
  weibo: {
    id: String,
    token: String,
    email: String,
    name: String,
  },
  qq: {
    id: String,
    token: String,
    email: String,
    name: String,
  },*/
});

class UserModel {
  get imgUrl() {
    let headimgurl = this.headimgurl;
    if ( headimgurl && headimgurl.indexOf('http://') === -1) {
      headimgurl = 'http://' + headimgurl;
    }
    return headimgurl;
  }

  get pwd() {
    return this._password;
  }

  set pwd(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.password = this.encryptPassword(password);
  }

  get userInfo() {
    return {
      'name': this.username,
      'role': this.role,
      'email': this.email,
      'headimgurl': this.imgUrl,
      'provider': this.provider,
    };
  }

  get token() {
    return {
      '_id': this._id,
      'role': this.role,
    };
  }

  // 生成盐
  makeSalt() {
    return crypto.randomBytes(16).toString('base64');
  }

  // 检查用户权限
  hasRole(role) {
    const selfRoles = this.role;
    return (selfRoles.indexOf('admin') !== -1 || selfRoles.indexOf(role) !== -1);
  }

  // 验证用户密码
  authenticate(plainText) {
    return this.encryptPassword(plainText) === this.password;
  }

  // 生成密码
  encryptPassword(password) {
    if (!password || !this.salt) return '';
    const salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
}

UserSchema
  .path('username')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({username: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, '该用户名已经被使用.');

UserSchema.plugin(loadClass, UserModel);
UserSchema.plugin(baseModel);
UserSchema.plugin(mongoosePaginate);
/*UserSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});
*/
UserSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.headimgurl = doc.imgUrl;
    delete ret.pass;
    delete ret.updated_at;
    delete ret.active;
    delete ret.collectedTopics;
    delete ret.collectedArticles;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', UserSchema);


