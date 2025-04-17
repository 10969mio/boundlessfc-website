const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // 環境変数の存在確認
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error("環境変数 MONGODB_URI が設定されていません");
            process.exit(1); // エラーが発生した場合はプロセスを終了
        }
        
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB接続エラー: ${error.message}`);
        process.exit(1); // エラーが発生した場合はプロセスを終了
    }
};

module.exports = connectDB;