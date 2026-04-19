const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        default: 100
    },
    type: {
        type: String,
        enum: ['Normal', 'Premium', 'IMAX', '4DX'],
        default: 'Normal'
    },
    theatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre',
        required: true
    },
    seatLayout: {
        type: Object,
        default: null
    },
    hasLayout: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Screen', screenSchema);