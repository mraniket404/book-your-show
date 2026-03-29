const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    movieId: {
        type: String,
        required: true,
        index: true
    },
    theatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    time: {
        type: String,
        required: true,
        enum: ['09:00', '12:00', '15:00', '18:00', '21:00', '00:00']
    },
    language: {
        type: String,
        required: true
    },
    format: {
        type: String,
        enum: ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX'],
        default: '2D'
    },
    priceMap: {
        normal: { type: Number, default: 200 },
        premium: { type: Number, default: 350 },
        recliner: { type: Number, default: 500 }
    },
    availableSeats: {
        type: Number,
        required: true
    },
    bookedSeats: [{
        type: String,
        default: []
    }],
    status: {
        type: String,
        enum: ['active', 'cancelled', 'completed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

showSchema.index({ movieId: 1, theatreId: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Show', showSchema);