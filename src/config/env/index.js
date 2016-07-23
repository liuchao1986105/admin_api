import path from 'path';
import _ from 'lodash';

const all = {
  env: process.env.NODE_ENV,
  name: '服务系统',
  root: path.normalize(__dirname + '/../../..'),
  port: process.env.PORT || 9000,
  domain: 'server.com',

  // 缓存时间
  cachetime: 60 * 60 * 1,

  // 是否初始化数据
  seedDB: false,

  session: {
    secrets: 'server-secret',
  },

  // 用户角色种类
  userRoles: ['user', 'admin'],

  // 管理员用户
  admin: 'moomoo',

  // 默认图片.
  defaultImage: 'http://upload.jackhu.top/blog/index/8x7hVJvpE3Z6ruwgtd2G.jpg',

  // cfliu是管理员
  admins: { cfliu: true },

  // 七牛配置
  qnConfig: {
    ACCESS_KEY: 'yEbF2Oo_BO4gSsoQcJ1-errUQ2Wgg27X3rp3HNsf',
    SECRET_KEY: 'dmP8PR0jeVAnVtbv77chknwKDo7qwmPwSeqKkW1D',
    BUCKET_NAME: 'bnbcamp',  // 七牛空间名称
    DOMAIN: '7xkm6g.com1.z0.glb.clouddn.com',  // 七牛配置域名
  },

  // 本地文件上传配置
  upload: {
    path: path.join(path.normalize(__dirname + '/../../..'), 'uploads/'),
    url: 'uploads/',
  },

  // 微信扫码
  wechatConfig: {
    AppID: 'wxa57d9a5057f4c8a8',
    AppSecret: 'b44bcf415eae0b0ef0bfc81ff35c68eb',
    // token: 'e6a0c486a65e44b5969a9823fccf1d94',
    // encodingAESKey: 'wApsDaMPSI7T4rRhSbvfZNx7loLoqgBryALRxDdzQ2s',
  },

  // 微信登录
  wxLogin: {
    AppID: 'wxe6daee2f551e94a7',
    AppSecret: '3000b99e67fa36b170b2cf373b37d326',
  },

  // ping++配置
  pingxx: {
    API_KEY: 'sk_live_P3Fm33YRj5m7Y0j933z3bYB6',
   // API_KEY: "sk_test_CmrjnDzbrznPH4e1W5H88SmL",
    APP_SECRET: 'b44bcf415eae0b0ef0bfc81ff35c68eb',
    APP_ID: 'app_COuvbHDiX1SKaXDq',
  },

  // 短信配置
  sms: {
    account: 'jksc103',
    password: 'jksc10355',
    content: '【xxxx】您的验证码是@，请于1分钟内正确输入',
    action: 'send',
    userid: '',
    sendTime: '',
    extno: '',
    passedcontent: '【xxxx】您的申请已审核通过，请完善您的信息',
  },

  // 邮箱配置
  mailConfig: {
    host: 'smtp.bnbcamp.com',  // host: 'smtp.mxhichina.com',
    port: 25,  // port: 465,SMTP 端口
    auth: {
      user: 'chao.liu@bnbcamp.com',
      pass: 'jingjing1314!@#$%',
    },
  },

  // 开启第三方登录
  snsLogins: ['github', 'qq'],

  // 第三方登录配置
  github: {
    clientID: 'github',
    clientSecret: 'clientSecret',
    callback: '/auth/github/callback',
  },

  weibo: {
    clientID: 'clientID',
    clientSecret: 'clientSecret',
    callbackURL: '/auth/weibo/callback',
  },

  qq: {
    clientID: 'clientID',
    clientSecret: 'clientSecret',
    callbackURL: '/auth/qq/callback',
  },

  // 爬虫url
  crawlerUrl: {
    khan: 'https://www.khanacademy.org',
    jd: 'http://www.jd.com',
  },
};

const config = _.merge(all, require('./' + process.env.NODE_ENV + '.js') || {});

module.exports = config;

