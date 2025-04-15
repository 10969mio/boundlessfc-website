// routes/snsLinks.js
const express = require('express');
const router = express.Router();
const snsLinkController = require('../controllers/SnsLinkController');
const auth = require('../middleware/auth');

// SNSリンク管理ページ（管理者のみ）
router.get('/', auth.isAuthenticated, auth.isAdmin, snsLinkController.getAllSnsLinks);

// 新規SNSリンク作成フォーム表示（管理者のみ）
router.get('/create', auth.isAuthenticated, auth.isAdmin, snsLinkController.createSnsLinkForm);

// 新規SNSリンク作成処理（管理者のみ）
router.post('/', auth.isAuthenticated, auth.isAdmin, snsLinkController.createSnsLink);

// SNSリンク編集フォーム表示（管理者のみ）
router.get('/edit/:id', auth.isAuthenticated, auth.isAdmin, snsLinkController.editSnsLinkForm);

// SNSリンク更新処理（管理者のみ）
router.post('/update/:id', auth.isAuthenticated, auth.isAdmin, snsLinkController.updateSnsLink);

// SNSリンク削除処理（管理者のみ）
router.post('/delete/:id', auth.isAuthenticated, auth.isAdmin, snsLinkController.deleteSnsLink);

module.exports = router;