// controllers/AuthController.js
const passport = require('passport');
const User = require('../models/User');

// ログイン画面表示
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    message: req.flash('loginMessage'),
    layout: 'layouts/auth' // 認証ページ用レイアウトを使用
  });
};

// ログイン処理
exports.postLogin = (req, res, next) => {
  // passport.authenticate()はPassportの認証関数
  // local-loginは先ほど設定した戦略の名前
  passport.authenticate('local-login', {
    successRedirect: '/',              // 認証成功時のリダイレクト先
    failureRedirect: '/auth/login',    // 認証失敗時のリダイレクト先
    failureFlash: true                 // 認証失敗時にフラッシュメッセージを表示
  })(req, res, next);
};


// 新規登録画面表示
exports.getSignup = (req, res) => {
  res.render('auth/signup', {
    title: 'Sign Up',
    message: req.flash('signupMessage'),
    layout: 'layouts/auth' // 認証ページ用レイアウトを使用
  });
};

// 新規登録処理
exports.postSignup = async (req, res, next) => {
  try {
    // 管理者アカウントの存在チェック
    const adminExists = await User.findOne({ role: 'admin' });
    
    // 管理者が既に存在する場合、新規ユーザーは常に一般ユーザーとして登録
    const userRole = adminExists ? 'user' : 'admin'; // 最初のユーザーのみ管理者になれる
    
    // 新規ユーザー作成処理（Passportの認証を使用）
    passport.authenticate('local-signup', {
      successRedirect: '/',
      failureRedirect: '/auth/signup',
      failureFlash: true
    })(req, res, next);
  } catch (err) {
    console.error('新規登録エラー:', err);
    req.flash('error', 'An error occurred during registration');
    res.redirect('/auth/signup');
  }
};

// ログアウト処理
exports.logout = (req, res, next) => {
  // req.logout()はPassportが提供するメソッドで、
  // ユーザーをログアウトさせる
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success', 'You have been logged out');
    res.redirect('/');
  });
};

// プロフィール画面表示
exports.getProfile = (req, res) => {
  res.render('auth/profile', {
    title: 'Profile',
    user: req.user,
    layout: 'layouts/auth' // 認証ページ用レイアウトを使用
  });
};

// プロフィール編集フォーム表示
exports.getEditProfile = (req, res) => {
  res.render('auth/edit-profile', { 
    title: 'Edit Profile',
    user: req.user,
    layout: 'layouts/auth' // 認証ページ用レイアウトを使用
  });
};

// プロフィール更新処理
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;
    
    // 現在のユーザーを取得
    const user = await User.findById(userId);
    
    // ユーザー名またはメールの重複チェック（自分以外）
    const existingUsername = await User.findOne({ username: username, _id: { $ne: userId } });
    if (existingUsername) {
      req.flash('error', 'This username is already in use');
      return res.redirect('/auth/profile/edit');
    }
    
    const existingEmail = await User.findOne({ email: email, _id: { $ne: userId } });
    if (existingEmail) {
      req.flash('error', 'This email address is already in use');
      return res.redirect('/auth/profile/edit');
    }
    
    // 更新するデータ
    const updateData = {
      username: username,
      email: email
    };
    
    // パスワード変更がリクエストされた場合
    if (newPassword) {
      // 現在のパスワードが正しいか確認
      if (!currentPassword || !user.comparePassword(currentPassword)) {
        req.flash('error', 'Current password is incorrect');
        return res.redirect('/auth/profile/edit');
      }
      
      // 新しいパスワードと確認用パスワードが一致するか確認
      if (newPassword !== confirmPassword) {
        req.flash('error', 'New password and confirmation password do not match');
        return res.redirect('/auth/profile/edit');
      }
      
      // パスワードを更新
      user.password = newPassword;
      await user.save(); // ここでパスワードは自動的にハッシュ化される
    } else {
      // パスワード以外の情報を更新
      await User.findByIdAndUpdate(userId, updateData);
    }
    
    req.flash('success', 'Profile has been updated');
    res.redirect('/auth/profile');
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    req.flash('error', 'An error occurred while updating profile');
    res.redirect('/auth/profile/edit');
  }
};