// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  slotId: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    unique: true // スロットIDは一意
  },
  title: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  opponent: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  updateDate: {
    type: Date,
    default: Date.now
  }
});

// 全てのイベントスロットを取得
eventSchema.statics.getAllSlots = async function() {
  // 既存のイベントを取得（最大4つまで）
  const events = await this.find().sort({ slotId: 1 }).limit(4);
  
  // 4つのスロットすべてがDBに存在することを確認
  const slots = [1, 2, 3, 4];
  const existingSlots = events.map(event => event.slotId);
  
  const missingSlots = slots.filter(slot => !existingSlots.includes(slot));
  
  if (missingSlots.length > 0) {
    const defaultEvents = missingSlots.map(slotId => {
      return {
        slotId,
        title: 'イベント未設定',
        eventType: 'OTHER',
        day: 1,
        month: 'JAN',
        year: new Date().getFullYear(),
        time: '00:00',
        venue: '未定',
        opponent: '',
        description: ''
      };
    });
    
    await this.insertMany(defaultEvents);
    return await this.find().sort({ slotId: 1 }).limit(4);
  }
  
  return events;
};

module.exports = mongoose.model('Event', eventSchema);