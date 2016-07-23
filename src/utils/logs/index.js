import path from 'path';
import bunyan from 'bunyan';
import config from '../../config/env';

const bunyanConfig = {
  name: 'server',
  serializers: {
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res,
    err: bunyan.stdSerializers.err,
  },
  streams: [
    {
      level: 'info',
      stream: process.stdout,
    },
    {
      level: 'trace',
      stream: process.stdout,
    },
    {
      level: 'debug',
      stream: process.stderr,
    },
    {
      type: 'rotating-file',
      level: 'error',
      path: path.join(config.root, 'logs/' + config.env + '-' + 'error.log'),
      period: '1d',  // daily rotation
      count: 7,       // keep 7 back copies
    },
  ],
};

const logger = global.logger = bunyan.createLogger(bunyanConfig);
/* const _error = global.logger.error;
global.logger.error = function tmp(obj) {
  if ((obj instanceof Error) && (obj.code === 40001 || obj.code === '40001')) {
    global.cache.del('wx_access_token:' + wechatConfig.appId);
  }

  _error.call(global.logger, obj);
}; */

module.exports = logger;
// module.exports = bunyan.createLogger(bunyanConfig);
