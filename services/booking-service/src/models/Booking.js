const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    showId: { type: String, required: true },
    seats: [{ row: String, number: Number, seatId: String, price: Number }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'failed'], default: 'pending' },
    paymentId: { type: String, default: null },
    holdExpiresAt: { type: Date, required: true },
    bookingReference: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date, default: null }
});

bookingSchema.pre('save', function(next) {
    if (!this.bookingReference) {
        this.bookingReference = 'BOOK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);