const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinaryの設定ステータスをチェック
console.log('=== CLOUDINARY CONFIG CHECK ===');
console.log('Environment variables set:',
  !!process.env.CLOUDINARY_CLOUD_NAME,
  !!process.env.CLOUDINARY_API_KEY,
  !!process.env.CLOUDINARY_API_SECRET
);

// Cloudinary設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 接続テスト
try {
  cloudinary.api.ping((error, result) => {
    if (error) {
      console.error('Cloudinary connection error:', error);
    } else {
      console.log('Cloudinary connection successful:', result.status);
    }
  });
} catch (e) {
  console.error('Failed to test Cloudinary connection:', e);
}

// ストレージの設定
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'boundless-fc',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }]
  }
});

console.log('CloudinaryStorage initialized');

// Multerの設定
const uploadPost = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB制限
});

console.log('Multer configured with Cloudinary storage');

module.exports = { cloudinary, uploadPost };