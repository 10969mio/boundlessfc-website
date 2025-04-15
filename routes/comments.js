// routes/comments.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/CommentController');
const auth = require('../middleware/auth');

// コメントを投稿（ログインユーザーのみ）
router.post('/create', auth.isAuthenticated, commentController.createComment);

// コメントを承認（管理者のみ）
router.post('/approve/:id', auth.isAuthenticated, auth.isAdmin, commentController.approveComment);

// コメントを削除（管理者のみ）
router.post('/delete/:id', auth.isAuthenticated, auth.isAdmin, commentController.deleteComment);

module.exports = router;