// routes/index.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/PostController');
const eventController = require('../controllers/EventController');

// ホームページ
router.get('/', postController.getLatestPosts, eventController.getHomeEvents, (req, res) => {
  res.render('main', {
    title: 'Home'
  });
});

// About Usページ
router.get('/about', (req, res) => {
  res.render('aboutus', { 
    title: 'About Us'
  });
});

// 連絡先ページ
router.get('/contact', (req, res) => {
  res.render('contact', { 
    title: 'Contact'
  });
});

module.exports = router;