const mongoose = require('mongoose');

const teamInfoSchema = new mongoose.Schema({
    clubName: {
        type: String,
        required: true,
        trim: true
    },
    clubDescription: {
        type: String,
        required: true,
        trim: true
    },
    practiceLocation: {
        type: String,
        required: true,
        trim: true
    },
    uniformImage: {
        type: String,   // 画像のパス
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

teamInfoSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.updatedAt = Date.now();
    }
    next();
});

const TeamInfo = mongoose.model('TeamInfo', teamInfoSchema);
module.exports = TeamInfo;
