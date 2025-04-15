// routes/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/PostController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { uploadPost } = require('../config/cloudinary');

// 記事一覧を表示
router.get('/', postController.getAllPosts);

// 管理者専用ルート - これらを先に定義
router.get('/manage', isAdmin, postController.manageAllPosts);

// 新規記事作成フォームを表示
router.get('/create', isAdmin, postController.createPostForm);

// 編集フォームを表示
router.get('/edit/:id', isAdmin, postController.editPostForm);

// POST処理
// 新規記事投稿処理 - uploadPost.single('image')で画像アップロード処理を設定
router.post('/', isAdmin, uploadPost.single('image'), postController.createPost);

// 記事更新処理
router.post('/update/:id', isAdmin, uploadPost.single('image'), postController.updatePost);

// 記事削除処理
router.post('/delete/:id', isAdmin, postController.deletePost);

// 個別記事を表示 - これを最後に配置（IDが他のルートと競合しないよう）
router.get('/:id', postController.getPostById);

module.exports = router;