const mongoose = require('mongoose');

// ✅ Define Movie schema reference (or import if exists)
// Since Movie model is in different service, we just use ref string

const showSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',  // ✅ This should match the model name in movie-service
        required: true
    },
    theatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre',
        required: true
    },
    screenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    prices: {
        normal: { type: Number, default: 180 },
        premium: { type: Number, default: 320 },
        recliner: { type: Number, default: 550 },
        sofa: { type: Number, default: 450 },
        wheelchair: { type: Number, default: 180 }
    },
    format: {
        type: String,
        enum: ['2D', '3D', 'IMAX', '4DX'],
        default: '2D'
    },
    availableSeats: {
        type: Number,
        default: 100
    },
    totalSeats: {
        type: Number,
        default: 100
    },
    bookedSeats: [{
        seatNumber: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        bookingTime: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['active', 'cancelled', 'completed'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Create indexes for faster queries
showSchema.index({ screenId: 1, date: 1, time: 1 });
showSchema.index({ theatreId: 1 });
showSchema.index({ movieId: 1 });
showSchema.index({ date: 1 });

module.exports = mongoose.model('Show', showSchema);