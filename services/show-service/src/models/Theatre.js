const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    row: { type: String, required: true },
    number: { type: Number, required: true },
    seatId: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['normal', 'premium', 'recliner', 'vip', 'couple'], 
        default: 'normal' 
    },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    isAccessible: { type: Boolean, default: false }, // Wheelchair accessible
    position: {
        x: { type: Number, default: 0 }, // For custom layout positioning
        y: { type: Number, default: 0 }
    }
});

const theatreSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    name: {
        type: String,
        required: [true, 'Theatre name is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        index: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        lat: Number,
        lng: Number
    },
    amenities: [{
        type: String,
        enum: ['Parking', 'Food Court', 'Wheelchair Access', 'Dolby Atmos', 'IMAX', '4DX', 'Recliner Seats', 'WiFi', 'AC']
    }],
    seatLayout: {
        type: {
            rows: Number,
            columns: Number,
            seats: [seatSchema],
            customDesign: {
                type: Boolean,
                default: false
            },
            backgroundImage: String,
            sections: [{
                name: String,
                seats: [String], // Seat IDs in this section
                color: String
            }]
        },
        default: {
            rows: 0,
            columns: 0,
            seats: [],
            customDesign: false
        }
    },
    totalSeats: {
        type: Number,
        default: 0
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        default: []
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for owner queries
theatreSchema.index({ ownerId: 1, isActive: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);