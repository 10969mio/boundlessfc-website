const session = require('express-session');
const MongoStore = require('connect-mongo');

module.exports = (app) => {
  // 環境変数の存在確認
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    console.error("環境変数 SESSION_SECRET が設定されていません");
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("環境変数 MONGODB_URI が設定されていません");
    process.exit(1);
  }

  // セッション管理
  const sessionConfig = {
    name: 'boundless_session', // デフォルト名からの変更でセッションハイジャック防止
    secret: sessionSecret,
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
      mongoUrl: mongoUri,
      ttl: 24 * 60 * 60, // セッションの有効期限（1日）
      autoRemove: 'native' // 期限切れセッションの自動削除
    })
  };

  app.use(session(sessionConfig));
};