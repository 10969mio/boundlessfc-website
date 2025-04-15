// middleware/auth.js
// ログイン確認ミドルウェア
// middleware/auth.js
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'このページにアクセスするにはログインが必要です');
  res.redirect('/auth/login');
};

exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'この操作には管理者権限が必要です');
  res.redirect('/');
};