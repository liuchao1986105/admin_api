// 开发环境配置
// ==================================
module.exports = {
  // 开发环境mongodb配置
  mongo: {
    uri: 'mongodb://localhost/server-dev',
    options: {
      db: {
        safe: true,
      },
    },
  },
  // 开发环境redis配置
  redis: {
    host: '127.0.0.1',
    port: 6379,
    // password: 'BEwm5gkXhuLh',
    // showFriendlyErrorStack: true,
    // db: 0,
  },
  seedDB: false,
  session: {
    cookie: {maxAge: 60000 * 5},
  },
};
