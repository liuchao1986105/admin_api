import mailer from 'nodemailer';
import config from '../../config/env';
import util from 'util';

const transport = mailer.createTransport('SMTP', config.mailConfig);
const SITE_ROOT_URL = 'http://www.lambda.com';

const sendMail = function sendMail(data) {
  if (config.env === 'test') {
    return;
  }
  transport.sendMail(data, function(err, info) {
    if (err) {
      global.logger.error(err);
    } else {
      global.logger.info('email sent');
    }
  });
};

exports.sendMail = sendMail;

/**
 * 发送激活通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 */
exports.sendActiveMail = function sendActiveMail(who, token, name) {
  const from = util.format('%s <%s>', config.name, config.mailConfig.auth.user);
  const to = who;
  const subject = config.name + '帐号激活';
  const html = '<p>您好：' + name + '</p>' +
    '<p>我们收到您在' + config.name + '的注册信息，请点击下面的链接来激活帐户：</p>' +
    '<h1><a href="' + SITE_ROOT_URL + '/active_account?key=' + token + '&name=' + name + '">激活链接</a></h1>';

  exports.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html,
  });
};

/**
 * 发送密码重置通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 */
exports.sendResetPassMail = function sendResetPassMail(who, token, name) {
  const from = util.format('%s <%s>', config.name, config.mailConfig.auth.user);
  const to = who;
  const subject = config.name + '密码重置';
  const html = '<p>您好：' + name + '</p>' +
    '<p>我们收到您在' + config.name + '重置密码的请求，请在24小时内单击下面的链接来重置密码：</p>' +
    '<a href="' + SITE_ROOT_URL + '/reset_pass?key=' + token + '&name=' + name + '">重置密码链接.</a>';

  exports.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html,
  });
};
