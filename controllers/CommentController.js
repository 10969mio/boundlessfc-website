// controllers/CommentController.js
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// コメントを作成
exports.createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    
    // 対象の記事が存在するか確認
    const post = await Post.findById(postId);
    if (!post) {
      req.flash('error', 'Post does not exist');
      return res.redirect('/posts');
    }
    
    // 新しいコメントを作成
    const newComment = new Comment({
      post: postId,
      user: req.user._id,
      content: content,
      // 管理者の場合は自動承認
      isApproved: req.user.role === 'admin'
    });
    
    await newComment.save();
    
    if (req.user.role === 'admin') {
      req.flash('success', 'Comment posted');
    } else {
      req.flash('success', 'Comment submitted. It will appear after admin approval');
    }
    
    res.redirect(`/posts/${postId}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while posting the comment');
    res.redirect(`/posts/${req.body.postId}`);
  }
};

// 管理者用: コメント承認
exports.approveComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      req.flash('error', 'Comment not found');
      return res.redirect('/admin/comments');
    }
    
    comment.isApproved = true;
    await comment.save();
    
    req.flash('success', 'Comment approved');
    res.redirect('/admin/comments');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while approving the comment');
    res.redirect('/admin/comments');
  }
};

// 管理者用: コメント削除
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      req.flash('error', 'Comment not found');
      return res.redirect('/admin/comments');
    }
    
    await Comment.deleteOne({ _id: req.params.id });
    
    req.flash('success', 'Comment deleted');
    
    // リダイレクト先を判断（記事ページからの削除か管理画面からの削除か）
    const redirectUrl = req.query.redirect || '/admin/comments';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while deleting the comment');
    res.redirect('/admin/comments');
  }
};

// 管理者用: 未承認コメント一覧取得
exports.getPendingComments = async (req, res) => {
  try {
    // 未承認コメントを取得し、ユーザー情報と記事情報も取得
    const pendingComments = await Comment.find({ isApproved: false })
      .sort({ createdAt: -1 })
      .populate('user', 'username')
      .populate('post', 'title');
      
    res.render('admin/comments', {
      title: 'Pending Comment Management',
      comments: pendingComments,
      layout: 'layouts/default'
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while retrieving comments');
    res.redirect('/admin/dashboard');
  }
};