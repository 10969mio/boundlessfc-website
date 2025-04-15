// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { isAuthenticated } = require('../middleware/auth');

// ログイン
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// 新規登録
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

// プロフィール編集ページ表示
router.get('/profile/edit', isAuthenticated, authController.getEditProfile);

// プロフィール更新処理
router.post('/profile/edit', isAuthenticated, authController.updateProfile);

// ログアウト
router.get('/logout', authController.logout);

// プロフィール（ログイン済みユーザーのみアクセス可能）
router.get('/profile', isAuthenticated, authController.getProfile);

module.exports = router;