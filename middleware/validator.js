// middleware/validator.js
const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');

// HTML特殊文字をエスケープし、安全なHTMLのみを許可する関数
const sanitizeOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  allowedAttributes: {
    'a': ['href', 'target', 'rel']
  },
  // rel="noopener noreferrer"を自動追加
  transformTags: {
    'a': (tagName, attribs) => {
      return {
        tagName,
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
          target: '_blank'
        }
      };
    }
  }
};

// 共通の検証ルール
const customValidation = {
  title: Joi.string().trim().max(200).required()
    .custom((value, helpers) => {
      return sanitizeHtml(value, { allowedTags: [] }); // タイトルにはHTMLを許可しない
    }),
  content: Joi.string().trim().max(5000).required()
    .custom((value, helpers) => {
      return sanitizeHtml(value, sanitizeOptions); // 一部のHTMLタグを許可
    }),
  name: Joi.string().trim().max(50).required()
    .custom((value, helpers) => {
      return sanitizeHtml(value, { allowedTags: [] });
    }),
  email: Joi.string().trim().email().required(),
  comment: Joi.string().trim().max(1000).required()
    .custom((value, helpers) => {
      return sanitizeHtml(value, sanitizeOptions);
    })
};

// モデル別のスキーマ定義
const schemas = {
  post: Joi.object({
    title: customValidation.title,
    content: customValidation.content,
    category: Joi.string().required()
  }),
  
  event: Joi.object({
    title: customValidation.title,
    description: customValidation.content,
    date: Joi.date().required(),
    location: Joi.string().trim().required()
  }),
  
  comment: Joi.object({
    content: customValidation.comment,
    postId: Joi.string().required()
  }),
  
  snsLink: Joi.object({
    platform: Joi.string().required(),
    url: Joi.string().uri().required()
  }),
  
  contact: Joi.object({
    name: customValidation.name,
    email: customValidation.email,
    message: Joi.string().trim().max(2000).required()
  })
};

// バリデーションミドルウェア
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      req.flash('error', `入力内容に問題があります: ${errorMessages}`);
      return res.status(400).redirect('back');
    }
    
    // 検証済みデータでリクエストボディを置き換え
    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  schemas
};