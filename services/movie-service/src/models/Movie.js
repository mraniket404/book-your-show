const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Movie title is required'],
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bhojpuri', 'Marathi', 'Bengali']
    },
    genre: [{
        type: String,
        enum: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi', 'Fantasy', 'Animation', 'Documentary']
    }],
    releaseDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    poster: {
        type: String,
        default: ''
    },
    trailer: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0
    },
    cast: [{
        name: String,
        role: String,
        image: String
    }],
    crew: [{
        name: String,
        role: String
    }],
    distributorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'upcoming', 'now-showing', 'ended'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

movieSchema.index({ title: 'text', description: 'text' });

movieSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    const now = new Date();
    if (this.status === 'approved') {
        if (now < this.releaseDate) {
            this.status = 'upcoming';
        } else if (now >= this.releaseDate && now <= this.endDate) {
            this.status = 'now-showing';
        } else {
            this.status = 'ended';
        }
    }
    next();
});

module.exports = mongoose.model('Movie', movieSchema);