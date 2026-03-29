const Booking = require('../models/Booking');
const seatLockService = require('../services/seatLockService');
const axios = require('axios');

const initiateBooking = async (req, res) => {
    try {
        const { showId, seats } = req.body;
        const userId = req.user.id;

        if (!showId || !seats || seats.length === 0) {
            return res.status(400).json({ success: false, message: 'Show ID and seats are required' });
        }

        const availability = await seatLockService.checkSeatsAvailability(showId, seats);
        if (!availability.available) {
            return res.status(409).json({ success: false, message: 'Some seats are not available', data: { unavailableSeats: availability.unavailableSeats } });
        }

        const lockResult = await seatLockService.lockSeats(showId, userId, seats);
        if (!lockResult.success) {
            return res.status(409).json({ success: false, message: lockResult.message, data: { failedSeats: lockResult.failedSeats } });
        }

        const totalAmount = seats.reduce((sum, seat) => sum + (seat.price || 200), 0);
        const holdExpiresAt = new Date();
        holdExpiresAt.setSeconds(holdExpiresAt.getSeconds() + (process.env.BOOKING_HOLD_TIME || 180));

        const booking = await Booking.create({ userId, showId, seats, totalAmount, status: 'pending', holdExpiresAt });

        res.status(200).json({
            success: true,
            message: 'Seats locked successfully. Complete payment within 3 minutes.',
            data: { bookingId: booking._id, bookingReference: booking.bookingReference, seats: lockResult.lockedSeats, totalAmount, holdExpiresAt }
        });
    } catch (error) {
        console.error('Initiate booking error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const confirmBooking = async (req, res) => {
    try {
        const { bookingId, paymentId } = req.body;
        const userId = req.user.id;

        const booking = await Booking.findOne({ _id: bookingId, userId, status: 'pending' });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found or already processed' });
        }

        if (new Date() > booking.holdExpiresAt) {
            await seatLockService.releaseSeats(booking.showId, userId, booking.seats);
            booking.status = 'cancelled';
            await booking.save();
            return res.status(410).json({ success: false, message: 'Booking hold time expired. Please try again.' });
        }

        await seatLockService.confirmSeats(booking.showId, userId, booking.seats);
        
        // Update show service - book seats
        try {
            await axios.post(`${process.env.SHOW_SERVICE_URL}/mraniket404/api/shows/${booking.showId}/book`, { seats: booking.seats });
        } catch (error) {
            console.error('Error updating show service:', error);
        }

        booking.status = 'confirmed';
        booking.paymentId = paymentId;
        booking.confirmedAt = new Date();
        await booking.save();

        res.status(200).json({ success: true, message: 'Booking confirmed successfully', data: { bookingReference: booking.bookingReference, seats: booking.seats, totalAmount: booking.totalAmount } });
    } catch (error) {
        console.error('Confirm booking error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findOne({ _id: bookingId, userId, status: 'pending' });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        await seatLockService.releaseSeats(booking.showId, userId, booking.seats);
        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getBookingByReference = async (req, res) => {
    try {
        const { reference } = req.params;
        const booking = await Booking.findOne({ bookingReference: reference });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getSeatAvailability = async (req, res) => {
    try {
        const { showId } = req.params;
        const heldSeats = await seatLockService.getHeldSeats(showId);
        res.status(200).json({ success: true, data: { held: heldSeats } });
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { initiateBooking, confirmBooking, cancelBooking, getUserBookings, getBookingByReference, getSeatAvailability };