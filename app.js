require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');
const passport = require('passport');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

// ログディレクトリの作成（存在しない場合）
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 環境変数からデータベース接続設定を取得
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soccer_team_db';
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key';

// パスポート設定を読み込み
require('./config/passport')(passport);

// Expressアプリの初期化
const app = express();

// 本番環境では信頼できるプロキシを設定
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// HTTPS強制（本番環境のみ）
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.get('host')}${req.url}`);
    }
    next();
  });
}

// ミドルウェアの設定 - 優先順位順
// 1. 基本的なボディパーサー
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. セキュリティ対策
// NoSQLインジェクション対策
app.use(mongoSanitize());

// レート制限の設定
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 同一IPからの最大リクエスト数
  message: 'ログイン試行回数が多すぎます。15分後に再試行してください。'
});

// CSP設定
const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'", 
      "'unsafe-inline'", 
      "'unsafe-eval'",
      "https://cdn.jsdelivr.net", 
      "https://*.cloudinary.com"
    ],
    styleSrc: [
      "'self'", 
      "'unsafe-inline'",  // インラインスタイルを許可
      "https://cdn.jsdelivr.net", 
      "https://fonts.googleapis.com"
    ],
    imgSrc: [
      "'self'", 
      "data:", 
      "https://res.cloudinary.com", 
      "https://*.cloudinary.com", 
      "blob:"
    ],
    fontSrc: [
      "'self'", 
      "data:", 
      "https://fonts.gstatic.com", 
      "https://cdn.jsdelivr.net"
    ],
    connectSrc: [
      "'self'", 
      "https://*.cloudinary.com",
      "https://api.cloudinary.com"  // API接続を明示的に許可
    ],
    frameSrc: ["'self'", "https://*.cloudinary.com"],
    mediaSrc: ["'self'", "https://*.cloudinary.com"],
    objectSrc: ["'none'"]
  }
};

// 環境に関わらず同じCSP設定を使用
app.use(helmet({
  contentSecurityPolicy: cspOptions
}));

// 3. セッション管理 - MongoDBストアを使用
require('./config/session')(app);

// 4. 認証
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// 5. テンプレートエンジン設定
app.use(expressLayouts);
app.set('layout', 'layouts/default');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 6. 静的ファイル設定
express.static.mime.define({'text/css': ['css']});
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',  // キャッシュ期間設定
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// デバッグ用のログ
console.log('静的ファイルのパス:', path.join(__dirname, 'public'));

// 7. グローバル変数の設定
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// CSP違反レポートエンドポイント
app.post('/csp-report', (req, res) => {
  if (req.body) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] CSP違反: ${JSON.stringify(req.body)}\n`;
    fs.appendFile(path.join(logDir, 'csp-violations.log'), logMessage, (err) => {
      if (err) console.error('CSP違反ログの書き込みに失敗:', err);
    });
  }
  res.status(204).end();
});

// データベース接続
const connectDB = require('./config/db');
connectDB();

// ルーターの設定
app.use('/posts', require('./routes/posts'));
app.use('/events', require('./routes/events'));
app.use('/sns-links', require('./routes/snsLinks'));
app.use('/comments', require('./routes/comments'));
// ログインルートにレート制限を適用
app.use('/auth/login', loginLimiter);
app.use('/auth', require('./routes/auth'));
app.use('/', require('./routes/index'));

// 404エラーハンドラー - 他のルートにマッチしなかった場合
app.use((req, res, next) => {
  const err = new Error('ページが見つかりません');
  err.status = 404;
  next(err);
});

// エラーハンドリング - エラーログとユーザー表示の分離
app.use((err, req, res, next) => {
  // エラーログを記録
  const timestamp = new Date().toISOString();
  const errorDetails = err.stack || err.toString();
  const logMessage = `[${timestamp}] ${errorDetails}\nRequest: ${req.method} ${req.url}\nUser: ${req.user ? req.user.username + ' (' + req.user._id + ')' : 'Not authenticated'}\n\n`;
  
  fs.appendFile(path.join(logDir, 'error.log'), logMessage, (appendErr) => {
    if (appendErr) console.error('エラーログの書き込みに失敗:', appendErr);
  });
  
  // エラーステータスコード設定
  const statusCode = err.status || 500;
  
 // 環境に応じたエラー表示
  if (process.env.NODE_ENV === 'production') {
    // 本番環境: ユーザーフレンドリーなエラーメッセージを表示
    if (statusCode === 404) {
      return res.status(404).render('error', {
        layout: false, // レイアウトを使用しないように指定
        title: 'ページが見つかりません',
        message: 'お探しのページは存在しないか、移動した可能性があります。'
      });
    } else {
      // 内部サーバーエラーなど
      return res.status(statusCode).render('error', {
        layout: false, // レイアウトを使用しないように指定
        title: 'エラーが発生しました',
        message: 'サーバーエラーが発生しました。しばらく経ってからもう一度お試しください。'
      });
    }
  } else {
    // 開発環境: 詳細なエラー情報を表示
    console.error(err.stack);
    return res.status(statusCode).render('error', {
      layout: false, // レイアウトを使用しないように指定
      title: `エラー (${statusCode})`,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});