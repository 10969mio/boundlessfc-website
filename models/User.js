const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin','user'],
        default: 'user'
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

//パスワードハッシュかのメソッド
userSchema.methods.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

//パスワード検証メソッド
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

//保存前にパスワードをハッシュ化
userSchema.pre('save', function(next) {
    if (this.isModified('password')) {
        this.password = this.hashPassword(this.password);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;