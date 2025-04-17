const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 環境変数の存在確認
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Cloudinary環境変数が設定されていません");
  process.exit(1);
}

// Cloudinary設定
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

// 開発環境でのみ接続テスト実行
if (process.env.NODE_ENV === 'development') {
  try {
    cloudinary.api.ping((error, result) => {
      if (error) {
        console.error('Cloudinary connection error');
      } else {
        console.log('Cloudinary connection successful');
      }
    });
  } catch (e) {
    console.error('Failed to test Cloudinary connection');
  }
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

// Multerの設定
const uploadPost = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB制限
});

module.exports = { cloudinary, uploadPost };