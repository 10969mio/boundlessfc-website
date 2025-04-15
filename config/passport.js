// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  // ユーザーのIDをセッションに保存
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // セッションからユーザーを取得
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
  
  // ログイン認証戦略
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',        // フォームのメールアドレスフィールド名
    passwordField: 'password',     // フォームのパスワードフィールド名
    passReqToCallback: true        // リクエストオブジェクトを戦略のコールバックに渡す
  },
  async (req, email, password, done) => {
    try {
      // メールアドレスでユーザーを検索
      const user = await User.findOne({ email: email });
      
      // ユーザーが見つからない場合
      if (!user) {
        return done(null, false, req.flash('error', 'ユーザーが見つかりません'));
      }
      
      // パスワードが一致しない場合
      if (!user.comparePassword(password)) {
        return done(null, false, req.flash('error', 'パスワードが正しくありません'));
      }
      
      // 認証成功
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
  // 新規登録戦略
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  async (req, email, password, done) => {
    try {
      // 既存ユーザーのチェック
      const existingUser = await User.findOne({ email: email });
      
      if (existingUser) {
        return done(null, false, req.flash('error', 'このメールアドレスは既に使用されています'));
      }
      
      // ユーザー名の重複チェック
      const existingUsername = await User.findOne({ username: req.body.username });
      
      if (existingUsername) {
        return done(null, false, req.flash('error', 'このユーザー名は既に使用されています'));
      }
      
      // 管理者アカウントの存在チェック
      const adminExists = await User.findOne({ role: 'admin' });
      
      // 新規ユーザー作成
      const newUser = new User({
        username: req.body.username,
        email: email,
        password: password, // 保存時に自動的にハッシュ化される
        role: adminExists ? 'user' : 'admin' // 最初のユーザーのみ管理者として登録
      });
      
      await newUser.save();
      return done(null, newUser);
    } catch (err) {
      return done(err);
    }
  }));
};