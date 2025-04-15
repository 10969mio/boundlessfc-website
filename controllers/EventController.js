// controllers/EventController.js
const Event = require('../models/Event');

// イベント管理画面を表示
exports.manageEvents = async (req, res) => {
  try {
    // 全てのイベントスロットを取得
    const events = await Event.getAllSlots();
    
    res.render('events/manage', {
      title: 'Manage Events',
      events,
      layout: 'layouts/events' // authレイアウトを明示的に指定
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while retrieving event information');
    res.redirect('/auth/profile');
  }
};

// イベント編集フォームを表示
exports.editEventForm = async (req, res) => {
  try {
    const slotId = parseInt(req.params.slotId);
    
    if (isNaN(slotId) || slotId < 1 || slotId > 4) {
      req.flash('error', 'Invalid slot ID');
      return res.redirect('/events/manage');
    }
    
    // イベントデータを取得
    let event = await Event.findOne({ slotId });
    
    // 存在しない場合はデフォルト値で作成
    if (!event) {
      event = new Event({
        slotId,
        title: 'Event Not Set',
        eventType: 'OTHER',
        day: 1,
        month: 'JAN',
        year: new Date().getFullYear(),
        time: '00:00',
        venue: 'TBD'
      });
      await event.save();
    }
    
    res.render('events/edit', {
      title: 'Event Editing',
      event,
      layout: 'layouts/events'
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while retrieving event information');
    res.redirect('/events/manage');
  }
};

// イベントを更新
exports.updateEvent = async (req, res) => {
  try {
    const slotId = parseInt(req.params.slotId);
    
    if (isNaN(slotId) || slotId < 1 || slotId > 4) {
      req.flash('error', 'Invalid slot ID');
      return res.redirect('/events/manage');
    }
    
    const { title, eventType, day, month, year, time, venue, opponent, description } = req.body;
    
    // 指定されたスロットのイベントを取得または作成
    let event = await Event.findOne({ slotId });
    
    if (!event) {
      event = new Event({ slotId });
    }
    
    // フィールドを更新
    event.title = title;
    event.eventType = eventType;
    event.day = parseInt(day);
    event.month = month;
    event.year = parseInt(year);
    event.time = time;
    event.venue = venue;
    event.opponent = opponent || '';
    event.description = description || '';
    event.updateDate = new Date();
    
    await event.save();
    
    req.flash('success', 'Event has been updated');
    res.redirect('/events/manage');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while updating the event');
    res.redirect(`/events/edit/${req.params.slotId}`);
  }
};

// イベントデータをリセット
exports.resetEvents = async (req, res) => {
  try {
    // 全てのイベントを削除
    await Event.deleteMany({});
    
    req.flash('success', 'Event data has been reset. New data will be automatically generated.');
    res.redirect('/events/manage');
  } catch (error) {
    console.error('データリセット中にエラーが発生しました:', error);
    req.flash('error', 'An error occurred while resetting data');
    res.redirect('/events/manage');
  }
};

// ホームページ用の全イベントスロットを取得するミドルウェア
exports.getHomeEvents = async (req, res, next) => {
  try {
    let events = await Event.getAllSlots();
    
    // 念のためデータを検証し、足りない項目があれば補完
    events = events.map(event => {
      return {
        slotId: event.slotId || 1,
        title: event.title || 'BOUNDLESS FC',
        eventType: event.eventType || 'EVENT',
        day: event.day || 1,
        month: event.month || 'JAN',
        year: event.year || new Date().getFullYear(),
        time: event.time || '00:00',
        venue: event.venue || 'TBD',
        opponent: event.opponent || '',
        description: event.description || ''
      };
    });
    
    // res.localsに格納してビューで使えるようにする
    res.locals.eventSlots = events;
    next();
  } catch (error) {
    console.error('イベント情報の取得中にエラーが発生しました:', error);
    
    // エラー時にはデフォルトのイベントデータを提供
    const currentYear = new Date().getFullYear();
    res.locals.eventSlots = [
      {
        slotId: 1,
        title: 'BOUNDLESS FC',
        eventType: 'FRIENDLY MATCH',
        day: 1,
        month: 'JAN',
        year: currentYear,
        time: '00:00',
        venue: 'TBD',
        opponent: 'TBD',
        description: ''
      },
      {
        slotId: 2,
        title: 'BOUNDLESS FC',
        eventType: 'FRIENDLY MATCH',
        day: 1,
        month: 'JAN',
        year: currentYear,
        time: '00:00',
        venue: 'TBD',
        opponent: 'TBD',
        description: ''
      },
      {
        slotId: 3,
        title: 'Event Not Set',
        eventType: 'OTHER',
        day: 1,
        month: 'JAN',
        year: currentYear,
        time: '00:00',
        venue: 'TBD',
        opponent: '',
        description: ''
      },
      {
        slotId: 4,
        title: 'Event Not Set',
        eventType: 'OTHER',
        day: 1,
        month: 'JAN',
        year: currentYear,
        time: '00:00',
        venue: 'TBD',
        opponent: '',
        description: ''
      }
    ];
    next();
  }
};