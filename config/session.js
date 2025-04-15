const session = require('express-session');
const MongoStore = require('connect-mongo');

module.exports = (app) => {
  // セッション管理
  const sessionConfig = {
    name: 'boundless_session', // デフォルト名からの変更でセッションハイジャック防止
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24時間
      secure: process.env.NODE_ENV === 'production', // 本番環境ではHTTPSのみ
      sameSite: 'lax' // CSRF保護の強化
    },
    // MongoDB セッションストアの設定
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost/boundlessfc-website',
      ttl: 24 * 60 * 60, // セッションの有効期限（1日）- 既存設定に合わせています
      autoRemove: 'native' // 期限切れセッションの自動削除
    })
  };

  app.use(session(sessionConfig));
};