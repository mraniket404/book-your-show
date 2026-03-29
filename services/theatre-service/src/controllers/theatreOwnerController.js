const Theatre = require('../models/Theatre');

const registerTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.create({
            ...req.body,
            ownerId: req.user.id,
            isVerified: false
        });
        res.status(201).json({ success: true, message: 'Theatre registered. Waiting for admin approval.', data: theatre });
    } catch (error) {
        console.error('Register theatre error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMyTheatres = async (req, res) => {
    try {
        const theatres = await Theatre.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: theatres.length, data: theatres });
    } catch (error) {
        console.error('Get my theatres error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const createSeatLayout = async (req, res) => {
    try {
        const { theatreId } = req.params;
        const { rows, columns, seats, sections } = req.body;
        
        const theatre = await Theatre.findOne({ _id: theatreId, ownerId: req.user.id });
        if (!theatre) {
            return res.status(404).json({ success: false, message: 'Theatre not found' });
        }
        
        if (seats && seats.length > 0) {
            theatre.seatLayout = {
                rows: rows || theatre.seatLayout.rows,
                columns: columns || theatre.seatLayout.columns,
                seats: seats,
                sections: sections || [],
                isCustom: true
            };
        } else if (rows && columns) {
            const generatedSeats = [];
            for (let i = 0; i < rows; i++) {
                const rowLetter = String.fromCharCode(65 + i);
                for (let j = 0; j < columns; j++) {
                    let type = 'normal';
                    let price = theatre.pricing.normal;
                    if (i >= rows - 2) { type = 'premium'; price = theatre.pricing.premium; }
                    if (i === rows - 1 && j < 4) { type = 'recliner'; price = theatre.pricing.recliner; }
                    generatedSeats.push({
                        seatId: `${rowLetter}${j + 1}`,
                        row: rowLetter,
                        number: j + 1,
                        type,
                        price,
                        position: { x: j * 55, y: i * 55 }
                    });
                }
            }
            theatre.seatLayout = { rows, columns, seats: generatedSeats, sections: sections || [], isCustom: false };
        }
        
        theatre.totalSeats = theatre.seatLayout.seats.length;
        await theatre.save();
        
        res.status(200).json({ success: true, message: 'Seat layout created', data: { totalSeats: theatre.totalSeats, seatLayout: theatre.seatLayout } });
    } catch (error) {
        console.error('Create layout error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updatePricing = async (req, res) => {
    try {
        const { theatreId } = req.params;
        const { normal, premium, recliner } = req.body;
        
        const theatre = await Theatre.findOne({ _id: theatreId, ownerId: req.user.id });
        if (!theatre) {
            return res.status(404).json({ success: false, message: 'Theatre not found' });
        }
        
        theatre.pricing = { normal, premium, recliner };
        if (theatre.seatLayout && theatre.seatLayout.seats) {
            theatre.seatLayout.seats = theatre.seatLayout.seats.map(seat => ({
                ...seat.toObject(),
                price: seat.type === 'normal' ? normal : seat.type === 'premium' ? premium : recliner
            }));
        }
        await theatre.save();
        
        res.status(200).json({ success: true, message: 'Pricing updated', data: theatre.pricing });
    } catch (error) {
        console.error('Update pricing error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateSeat = async (req, res) => {
    try {
        const { theatreId, seatId } = req.params;
        const { type, price, isAccessible } = req.body;
        
        const theatre = await Theatre.findOne({ _id: theatreId, ownerId: req.user.id });
        if (!theatre) {
            return res.status(404).json({ success: false, message: 'Theatre not found' });
        }
        
        const seatIndex = theatre.seatLayout.seats.findIndex(s => s.seatId === seatId);
        if (seatIndex === -1) {
            return res.status(404).json({ success: false, message: 'Seat not found' });
        }
        
        if (type) theatre.seatLayout.seats[seatIndex].type = type;
        if (price) theatre.seatLayout.seats[seatIndex].price = price;
        if (isAccessible !== undefined) theatre.seatLayout.seats[seatIndex].isAccessible = isAccessible;
        
        await theatre.save();
        res.status(200).json({ success: true, message: 'Seat updated', data: theatre.seatLayout.seats[seatIndex] });
    } catch (error) {
        console.error('Update seat error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { registerTheatre, getMyTheatres, createSeatLayout, updatePricing, updateSeat };