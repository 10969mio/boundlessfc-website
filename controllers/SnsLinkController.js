// controllers/SnsLinkController.js
const SnsLink = require('../models/SnsLink');

// 全SNSリンクを取得（管理者用）
exports.getAllSnsLinks = async (req, res) => {
  try {
    const snsLinks = await SnsLink.find().sort({ displayOrder: 1 });
    
    res.render('sns-links/index', {
      title: 'SNS Link Management',
      snsLinks,
      layout: 'layouts/default'
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while retrieving SNS links');
    res.redirect('/admin/dashboard');
  }
};

// 新規SNSリンク作成フォーム表示
exports.createSnsLinkForm = (req, res) => {
  res.render('sns-links/create', {
    title: 'Create New SNS Link',
    layout: 'layouts/default'
  });
};

// 新規SNSリンク作成処理
exports.createSnsLink = async (req, res) => {
  try {
    const { platform, url, icon, displayOrder, isActive } = req.body;
    
    const newSnsLink = new SnsLink({
      platform,
      url,
      icon: icon || 'bi bi-link-45deg',
      displayOrder: displayOrder || 0,
      isActive: isActive === 'on'
    });
    
    await newSnsLink.save();
    
    req.flash('success', 'SNS link has been created');
    res.redirect('/sns-links');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while creating the SNS link');
    res.redirect('/sns-links/create');
  }
};

// SNSリンク編集フォーム表示
exports.editSnsLinkForm = async (req, res) => {
  try {
    const snsLink = await SnsLink.findById(req.params.id);
    
    if (!snsLink) {
      req.flash('error', 'SNS link not found');
      return res.redirect('/sns-links');
    }
    
    res.render('sns-links/edit', {
      title: 'Edit SNS Link',
      snsLink,
      layout: 'layouts/default'
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while retrieving the SNS link');
    res.redirect('/sns-links');
  }
};

// SNSリンク更新処理
exports.updateSnsLink = async (req, res) => {
  try {
    const { platform, url, icon, displayOrder, isActive } = req.body;
    
    const snsLink = await SnsLink.findById(req.params.id);
    
    if (!snsLink) {
      req.flash('error', 'SNS link not found');
      return res.redirect('/sns-links');
    }
    
    snsLink.platform = platform;
    snsLink.url = url;
    snsLink.icon = icon || 'bi bi-link-45deg';
    snsLink.displayOrder = displayOrder || 0;
    snsLink.isActive = isActive === 'on';
    
    await snsLink.save();
    
    req.flash('success', 'SNS link has been updated');
    res.redirect('/sns-links');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while updating the SNS link');
    res.redirect(`/sns-links/edit/${req.params.id}`);
  }
};

// SNSリンク削除処理
exports.deleteSnsLink = async (req, res) => {
  try {
    const snsLink = await SnsLink.findById(req.params.id);
    
    if (!snsLink) {
      req.flash('error', 'SNS link not found');
      return res.redirect('/sns-links');
    }
    
    await SnsLink.deleteOne({ _id: req.params.id });
    
    req.flash('success', 'SNS link has been deleted');
    res.redirect('/sns-links');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while deleting the SNS link');
    res.redirect('/sns-links');
  }
};

// アクティブなSNSリンクを取得（パブリック用・ミドルウェア）
exports.getActiveSnsLinks = async (req, res, next) => {
  try {
    const activeSnsLinks = await SnsLink.find({ isActive: true })
      .sort({ displayOrder: 1 });
    
    // res.localsに格納してビューで使えるようにする
    res.locals.snsLinks = activeSnsLinks;
    next();
  } catch (error) {
    console.error('SNSリンクの取得中にエラーが発生しました:', error);
    res.locals.snsLinks = [];
    next();
  }
};