// 生产环境配置
// =================================
module.exports = {
  // 生产环境mongodb配置
  mongo: {
    uri: 'mongodb://localhost/mooTasksDB',
    // "mongodb://capricorn:EBN5dKcHpGzqg4i9J9Gw8O@101.200.134.85:32772/wddb",
    options: {
      db: {
        safe: true,
      },
      // user:'user',          //生产环境用户名
      // pass:'pass'           //生产环境密码
    },
  },
  // 生产环境redis配置
  redis: {
    host: '127.0.0.1',
    port: 6379,
    // password: 'BEwm5gkXhuLh',
    db: 1,
  },

  // 生产环境cookie是否需要domain视具体情况而定.
  session: {
    cookie: {maxAge: 60000 * 5},
  },
};
