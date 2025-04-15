// routes/events.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/EventController');
const auth = require('../middleware/auth');

// イベント管理画面（管理者のみ）
router.get('/manage', auth.isAuthenticated, auth.isAdmin, eventController.manageEvents);

// イベント編集フォーム（管理者のみ）
router.get('/edit/:slotId', auth.isAuthenticated, auth.isAdmin, eventController.editEventForm);

// イベント更新処理（管理者のみ）
router.post('/update/:slotId', auth.isAuthenticated, auth.isAdmin, eventController.updateEvent);

// イベントデータリセット（管理者のみ）
router.get('/reset', auth.isAuthenticated, auth.isAdmin, eventController.resetEvents);

module.exports = router;