const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chattSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    text: {
        type: String,
        maxLength: [300, "Cannot exceed 300 characters"],
        default: ''
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    edited: {
        type: Boolean,
        default: false
    },
    media: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true }
    }],
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chatt",
        default: null
    },
    replyCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Chatt", chattSchema);