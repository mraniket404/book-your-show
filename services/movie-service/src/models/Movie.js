const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        min: 30,
        max: 300
    },
    language: {
        type: String,
        required: true,
        trim: true
    },
    genre: {
        type: [String],
        required: true
    },
    releaseDate: {
        type: Date,
        required: true
    },
    poster: {
        type: String,
        default: 'https://via.placeholder.com/300x450?text=No+Poster'
    },
    trailer: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['upcoming', 'now-showing'],
        default: 'upcoming'
    },
    distributorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Movie', movieSchema);