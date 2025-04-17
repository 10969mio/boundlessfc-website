// controllers/PostController.js
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { cloudinary } = require('../config/cloudinary');

// 全ての記事を取得してビューでレンダリング
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'username');
    
    // HTMLビューをレンダリング
    res.render('posts/index', { 
      title: 'Articles List', 
      posts: posts,
      layout: 'layouts/blog'
    });
  } catch (error) {
    console.error('記事一覧の取得中にエラーが発生しました:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'A server error occurred',
      layout: 'layouts/blog'
    });
  }
};

// 個別の記事を取得してビューでレンダリング
exports.getPostById = async (req, res) => {
  try {
    // 記事を取得し、著者情報も一緒に取得
    const post = await Post.findById(req.params.id)
      .populate('author', 'username');
    
    if (!post) {
      return res.status(404).render('error', { 
        title: 'Page Not Found', 
        message: 'Article not found',
        layout: 'layouts/blog' // blog.ejsレイアウトを使用
      });
    }
    
    // 承認済みコメントを取得
    const comments = await Comment.find({ 
      post: post._id,
      isApproved: true 
    })
    .sort({ createdAt: -1 })
    .populate('user', 'username');
    
    // HTMLビューをレンダリング
    res.render('posts/show', { 
      title: post.title, 
      post: post,
      comments: comments,
      layout: 'layouts/blog' // blog.ejsレイアウトを使用
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'A server error occurred',
      layout: 'layouts/blog' // blog.ejsレイアウトを使用
    });
  }
};

// 新規記事投稿フォームを表示（管理者用）
exports.createPostForm = (req, res) => {
  res.render('posts/create', { 
    title: 'Create New Article', 
    layout: 'layouts/auth' // auth.ejsレイアウトを使用（管理者ページ）
  });
};

// 記事編集フォームを表示（管理者用）
exports.editPostForm = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).render('error', { 
        title: 'Page Not Found', 
        message: 'Article not found',
        layout: 'layouts/auth' // auth.ejsレイアウトを使用（管理者ページ）
      });
    }
    
    res.render('posts/edit', { 
      title: 'Edit Article', 
      post: post,
      layout: 'layouts/auth' // auth.ejsレイアウトを使用（管理者ページ）
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'A server error occurred',
      layout: 'layouts/auth' // auth.ejsレイアウトを使用（管理者ページ）
    });
  }
};

// 新規記事の投稿（フォーム送信処理）
exports.createPost = async (req, res) => {
  try {
    // 新しい記事オブジェクトを作成
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user._id
    });

    if (req.file) {
      // 画像がアップロードされた場合
      newPost.image = req.file.secure_url || req.file.url || req.file.path || '';
      newPost.imagePublicId = req.file.public_id || req.file.filename || '';
    } else {
      // デフォルト画像のパス
      newPost.image = '/images/placeholder.jpg';
    }
    
    // データベースに保存
    const savedPost = await newPost.save();
    
    req.flash('success', 'Article has been created');
    res.redirect('/posts');
  } catch (error) {
    console.error('Article creation error:', error);
    req.flash('error', 'An error occurred: ' + error.message);
    res.redirect('/posts/create');
  }
};

// 記事を更新（フォーム送信処理）
exports.updatePost = async (req, res) => {
  try {
    // 更新するフィールドを取得
    const updateData = {
      title: req.body.title,
      content: req.body.content
    };
    
    // 現在の記事データを取得
    const post = await Post.findById(req.params.id);
    if (!post) {
      req.flash('error', 'Article not found');
      return res.redirect('/posts');
    }
    
    // 画像ファイルがアップロードされた場合
    if (req.file) {
      // 古い画像をCloudinaryから削除（もし存在すれば）
      if (post.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(post.imagePublicId);
        } catch (cloudinaryError) {
          console.error('An error occurred while deleting the old image:', cloudinaryError);
        }
      }
      
      // 新しい画像のパスを設定
      updateData.image = req.file.secure_url || req.file.url || req.file.path || '';
      updateData.imagePublicId = req.file.public_id || req.file.filename || '';
    }
    
    // データベースの記事を更新
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    req.flash('success', 'Article has been updated');
    res.redirect(`/posts/${updatedPost._id}`);
  } catch (error) {
    console.error('Article update error:', error);
    req.flash('error', 'An error occurred: ' + error.message);
    res.redirect(`/posts/edit/${req.params.id}`);
  }
};

// 記事を削除
exports.deletePost = async (req, res) => {
  try {
    // データベースから記事を取得
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      req.flash('error', 'Article not found');
      return res.redirect('/posts');
    }
    
    // Cloudinaryから画像を削除（もし存在すれば）
    if (post.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(post.imagePublicId);
      } catch (cloudinaryError) {
        console.error('An error occurred while deleting the image:', cloudinaryError);
      }
    }
    
    // 関連するコメントを削除
    await Comment.deleteMany({ post: post._id });
    
    // データベースから記事を削除
    await Post.deleteOne({ _id: req.params.id });
    
    req.flash('success', 'Article has been deleted');
    res.redirect('/posts');
  } catch (error) {
    console.error('Article deletion error:', error);
    req.flash('error', 'An error occurred: ' + error.message);
    res.redirect('/posts');
  }
};

// ホームページ用の最新記事6件を取得
exports.getLatestPosts = async (req, res, next) => {
  try {
    const latestPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('author', 'username');
    
    // res.localsに格納してビューで使えるようにする
    res.locals.latestPosts = latestPosts;
    next();
  } catch (error) {
    console.error('最新記事の取得中にエラーが発生しました:', error);
    res.locals.latestPosts = [];
    next();
  }
};

// 管理者用記事管理ページ
exports.manageAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    
    res.render('posts/manage', {
      title: 'Article Management',
      posts: posts,
      layout: 'layouts/auth' // auth.ejsレイアウトを使用（管理者ページ）
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while retrieving article information');
    res.redirect('/auth/profile');
  }
};