const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    seatId: { type: String, required: true, unique: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
    type: { type: String, enum: ['normal', 'premium', 'recliner', 'vip'], default: 'normal' },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    isAccessible: { type: Boolean, default: false },
    position: { x: Number, y: Number }
});

const theatreSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    city: { type: String, required: true, index: true },
    address: { type: String, required: true },
    amenities: [String],
    images: [String],
    contactNumber: String,
    email: String,
    description: String,
    seatLayout: {
        rows: Number,
        columns: Number,
        seats: [seatSchema],
        sections: [{ name: String, color: String, seatIds: [String] }],
        isCustom: { type: Boolean, default: false }
    },
    totalSeats: { type: Number, default: 0 },
    screenCount: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    pricing: {
        normal: { type: Number, default: 200 },
        premium: { type: Number, default: 350 },
        recliner: { type: Number, default: 500 }
    },
    createdAt: { type: Date, default: Date.now }
});

theatreSchema.pre('save', function(next) {
    if (this.seatLayout && this.seatLayout.seats) {
        this.totalSeats = this.seatLayout.seats.length;
    }
    next();
});

theatreSchema.index({ name: 'text', city: 'text' });

module.exports = mongoose.model('Theatre', theatreSchema);