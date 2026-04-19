const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    seatId: { type: String, required: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
    type: { type: String, enum: ['normal', 'premium', 'recliner'], default: 'normal' },
    price: { type: Number, default: 200 },
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    position: { x: Number, y: Number }
});

const screenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    type: { type: String, enum: ['Normal', 'Premium', 'IMAX', '4DX'], default: 'Normal' },
    seatLayout: {
        rows: { type: Number, default: 8 },
        cols: { type: Number, default: 10 },
        totalSeats: { type: Number, default: 80 },
        seats: [seatSchema],
        isConfigured: { type: Boolean, default: false }
    }
});

const theatreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Theatre name is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    pincode: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    amenities: [{
        type: String
    }],
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    screens: [screenSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Theatre', theatreSchema);