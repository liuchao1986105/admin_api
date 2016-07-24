import Promise from 'bluebird';
import { User } from '../models/user';
import { swallow } from '../utils/decorators';
import captchapng from 'captchapng';
import validator from 'validator';
import config from '../config/env';
import auth from '../auth/auth.service';

export default class UserController {
  @swallow
  static async getUser(req, res, next) {
    global.logger.info(req.params.user_id);
    let user = await User.findByIdAsync(req.params.user_id);
    return res.status(200).json(user.userInfo);
  }

  @swallow
  static async getMe(req, res, next) {
    const userId = req.user._id;
    let user = await User.findByIdAsync(userId);
    //user = await user.populate([ {path: 'collectedTopics', model: 'Topic', select: '_id  title description'}]).execPopulate();
    res.json(user.userInfo);
  }

  @swallow
  static async signUp(req, res, next){
    const name = validator.escape(validator.trim(req.body.name));
    const email = validator.trim(req.body.email);
    const password = validator.trim(req.body.password);
    let errorMsg;
    if (process.env.NODE_ENV !== 'test') {
      if (!req.body.captcha) {
        errorMsg = '验证码不能为空';
      } else if (req.session.captcha !== parseInt(req.body.captcha)) {
        errorMsg = '验证码错误';
      }
    }

    if (!name || !password) {
      errorMsg = '用户名或密码不能为空';
    } else if(!email) {
      errorMsg = '邮箱地址不能为空';
    }else if(!validator.isEmail(email)) {
      errorMsg = "邮箱地址不合法";
    }

    let user = await User.findOneAsync({username:name});
    if ( user){
      errorMsg = "该用户名已经存在";
    }

    user = await User.findOneAsync({email:email});
    if ( user){
      errorMsg = "该邮箱名已经存在";
    }

    if (errorMsg) {
      return res.status(400).send({error_msg: errorMsg});
    }

    const newUser = new User();    //var newUser = new User(req.body);
    newUser.username = name;
    newUser.email = email;
    newUser.pwd = password;
    //newUser.role = 'user';

    user = await newUser.saveAsync();
    const token = auth.signToken(user._id);
    return res.status(200).json({success:true, token: token, user_id:user._id});
  }

  @swallow
  static async updateUser(req, res, next){
    global.logger.debug(req.user._id.toString(), 'user_id');
    if (req.params.user_id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).send({success: false, data: '没有权限对该用户进行更新'});
    }

    const name = validator.escape(validator.trim(req.body.name));
    const email = validator.trim(req.body.email);

    let error;
    if(name === '') {
      error = '用户名不能为空';
    }else if(email === '') {
      error = '邮箱地址不能为空';
    }else if(name.length <= 2 || name.length >15) {
      error = '用户名不能少于2个字符或多于15个字符';
    }else if(email.length <=4 || email.length > 30 || !validator.isEmail(email)) {
      error = "邮箱地址不合法";
    }
    if(error){
      return res.status(422).send({success: false, error: error});
    }

    let user = await User.findByIdAsync(req.params.user_id);
    user.username = name;
    user.email = email;
    if (req.body.password) {
      user.pwd = validator.trim(req.body.password);
    }
    if (req.body.role) {
      user.role = req.body.role;
    }
    await user.saveAsync();
    return res.status(200).send({success: true, user_id: user._id});
  }

  static async deleteUser(req, res, next){
    const userId = req.user._id;

    if(String(userId) === String(req.params.user_id)){
      return res.status(403).send({success: false, data:"不能删除自己已经登录的账号"});
    }
    let user = await User.findByIdAsync(req.params.user_id);
    user.active = false;
    await user.saveAsync();
    return res.status(200).send({success: true, data: 'delete success'});
  }

  static getCaptcha(req, res, next){
    let captcha = parseInt(Math.random() * 9000 + 1000);
    global.logger.debug(req.session);
    req.session.captcha = captcha;
    const pic = new captchapng(80, 30, captcha);
    pic.color(0, 0, 0, 0);
    pic.color(200, 200, 200, 255);

    const img = pic.getBase64();
    const imgbase64 = new Buffer(img, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    return res.end(imgbase64);
  }

  // 获取第三方登录列表.
  static getSnsLogins(req,res,next){
    if(config.snsLogins){
      return res.status(200).json({success: true, data: config.snsLogins});
    }else{
      return res.status(404).send();
    }
  }

}
