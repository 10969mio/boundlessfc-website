// models/SnsLink.js
const mongoose = require('mongoose');

const snsLinkSchema = new mongoose.Schema({
  // プラットフォーム名（Instagram、X、WhatsAppなど）
  platform: {
    type: String,
    required: true,
    trim: true
  },
  // URL
  url: {
    type: String,
    required: true,
    trim: true
  },
  // アイコンクラス（Font Awesome等で使用）
  icon: {
    type: String,
    default: 'bi bi-link-45deg'
  },
  // 表示順
  displayOrder: {
    type: Number,
    default: 0
  },
  // 表示状態（有効/無効）
  isActive: {
    type: Boolean,
    default: true
  },
  // 作成日時
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 更新日時
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新前に更新日時を設定
snsLinkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const SnsLink = mongoose.model('SnsLink', snsLinkSchema);

module.exports = SnsLink;