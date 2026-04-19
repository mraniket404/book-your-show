const Theatre = require('../models/Theatre');

// ==================== PUBLIC FUNCTIONS ====================

// Get all unique cities
const getCities = async (req, res) => {
    try {
        const cities = await Theatre.distinct('city');
        res.status(200).json({
            success: true,
            data: cities
        });
    } catch (error) {
        console.error('Get cities error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ==================== THEATRE FUNCTIONS ====================

// Create theatre
const createTheatre = async (req, res) => {
    try {
        const { name, address, city, pincode, phone, amenities } = req.body;
        
        const existingTheatre = await Theatre.findOne({ ownerId: req.user.id });
        if (existingTheatre) {
            return res.status(400).json({
                success: false,
                message: 'You already have a registered theatre'
            });
        }
        
        const theatre = new Theatre({
            name,
            address,
            city,
            pincode: pincode || '',
            phone: phone || '',
            amenities: amenities || [],
            ownerId: req.user.id,
            screens: []
        });
        
        await theatre.save();
        
        res.status(201).json({
            success: true,
            data: theatre,
            message: 'Theatre created successfully'
        });
    } catch (error) {
        console.error('Create theatre error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// Get my theatre
const getMyTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: theatre
        });
    } catch (error) {
        console.error('Get my theatre error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update theatre
const updateTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        const { name, address, city, pincode, phone, amenities, isActive } = req.body;
        
        if (name) theatre.name = name;
        if (address) theatre.address = address;
        if (city) theatre.city = city;
        if (pincode) theatre.pincode = pincode;
        if (phone) theatre.phone = phone;
        if (amenities) theatre.amenities = amenities;
        if (typeof isActive === 'boolean') theatre.isActive = isActive;
        
        await theatre.save();
        
        res.status(200).json({
            success: true,
            data: theatre,
            message: 'Theatre updated successfully'
        });
    } catch (error) {
        console.error('Update theatre error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete theatre
const deleteTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findOneAndDelete({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Theatre deleted successfully'
        });
    } catch (error) {
        console.error('Delete theatre error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ==================== SCREEN FUNCTIONS ====================

// Add screen
const addScreen = async (req, res) => {
    try {
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        const { name, capacity, type } = req.body;
        
        const newScreen = {
            name: name || `Screen ${(theatre.screens?.length || 0) + 1}`,
            capacity: capacity || 100,
            type: type || 'Normal',
            seatLayout: {
                rows: 8,
                cols: 10,
                screenType: type || 'Normal',
                isConfigured: false,
                seats: []  // Will be generated when layout is saved
            }
        };
        
        theatre.screens.push(newScreen);
        await theatre.save();
        
        const addedScreen = theatre.screens[theatre.screens.length - 1];
        
        res.status(201).json({
            success: true,
            data: addedScreen,
            message: 'Screen added successfully'
        });
    } catch (error) {
        console.error('Add screen error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// Get all screens
const getScreens = async (req, res) => {
    try {
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: theatre.screens || []
        });
    } catch (error) {
        console.error('Get screens error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get single screen
const getScreenById = async (req, res) => {
    try {
        const { screenId } = req.params;
        
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        const screen = theatre.screens.id(screenId);
        
        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: screen
        });
    } catch (error) {
        console.error('Get screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update screen
const updateScreen = async (req, res) => {
    try {
        const { screenId } = req.params;
        const { name, capacity, type } = req.body;
        
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        const screen = theatre.screens.id(screenId);
        
        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found'
            });
        }
        
        if (name) screen.name = name;
        if (capacity) screen.capacity = capacity;
        if (type) screen.type = type;
        
        await theatre.save();
        
        res.status(200).json({
            success: true,
            data: screen,
            message: 'Screen updated successfully'
        });
    } catch (error) {
        console.error('Update screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete screen
const deleteScreen = async (req, res) => {
    try {
        const { screenId } = req.params;
        
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        theatre.screens = theatre.screens.filter(s => s._id.toString() !== screenId);
        await theatre.save();
        
        res.status(200).json({
            success: true,
            message: 'Screen deleted successfully'
        });
    } catch (error) {
        console.error('Delete screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ==================== SEAT LAYOUT FUNCTIONS ====================

// Save seat layout with seat generation
const saveSeatLayout = async (req, res) => {
    try {
        const { screenId } = req.params;
        const { rows, cols, screenType } = req.body;
        
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        const screen = theatre.screens.id(screenId);
        
        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found'
            });
        }
        
        const finalRows = rows || 8;
        const finalCols = cols || 10;
        
        // Generate seats based on row position
        const seats = [];
        const totalSeats = finalRows * finalCols;
        
        for (let row = 0; row < finalRows; row++) {
            const rowLetter = String.fromCharCode(65 + row);
            
            // Determine seat type based on row position
            let seatType = 'normal';
            let price = 180;
            
            if (row >= finalRows - 3) {
                seatType = 'recliner';
                price = 550;
            } else if (row >= finalRows - 6) {
                seatType = 'premium';
                price = 320;
            } else {
                seatType = 'normal';
                price = 180;
            }
            
            for (let col = 1; col <= finalCols; col++) {
                seats.push({
                    seatId: `${rowLetter}${col}`,
                    row: rowLetter,
                    number: col,
                    type: seatType,
                    price: price,
                    isBooked: false,
                    isLocked: false,
                    lockedBy: null,
                    lockedAt: null
                });
            }
        }
        
        screen.seatLayout = {
            rows: finalRows,
            cols: finalCols,
            screenType: screenType || screen.type,
            totalSeats: totalSeats,
            seats: seats,
            isConfigured: true
        };
        
        screen.capacity = totalSeats;
        
        await theatre.save();
        
        res.status(200).json({
            success: true,
            data: screen,
            message: `Layout saved! ${totalSeats} seats configured.`
        });
    } catch (error) {
        console.error('Save layout error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// Get seat layout
const getSeatLayout = async (req, res) => {
    try {
        const { screenId } = req.params;
        
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        const screen = theatre.screens.id(screenId);
        
        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: screen.seatLayout || null,
            isConfigured: screen.seatLayout?.isConfigured || false
        });
    } catch (error) {
        console.error('Get layout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Lock seat (temporary hold for booking)
const lockSeat = async (req, res) => {
    try {
        const { screenId, seatId } = req.params;
        const { userId } = req.body;
        
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        const screen = theatre.screens.id(screenId);
        
        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found'
            });
        }
        
        const seat = screen.seatLayout.seats.find(s => s.seatId === seatId);
        
        if (!seat) {
            return res.status(404).json({
                success: false,
                message: 'Seat not found'
            });
        }
        
        if (seat.isBooked) {
            return res.status(400).json({
                success: false,
                message: 'Seat is already booked'
            });
        }
        
        if (seat.isLocked && seat.lockedBy !== userId) {
            const lockTime = new Date(seat.lockedAt);
            const now = new Date();
            const diffMinutes = (now - lockTime) / 1000 / 60;
            
            if (diffMinutes < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Seat is locked by another user'
                });
            }
        }
        
        seat.isLocked = true;
        seat.lockedBy = userId;
        seat.lockedAt = new Date();
        
        await theatre.save();
        
        res.status(200).json({
            success: true,
            data: seat,
            message: 'Seat locked for 10 minutes'
        });
    } catch (error) {
        console.error('Lock seat error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Unlock seat
const unlockSeat = async (req, res) => {
    try {
        const { screenId, seatId } = req.params;
        const { userId } = req.body;
        
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        const screen = theatre.screens.id(screenId);
        
        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found'
            });
        }
        
        const seat = screen.seatLayout.seats.find(s => s.seatId === seatId);
        
        if (!seat) {
            return res.status(404).json({
                success: false,
                message: 'Seat not found'
            });
        }
        
        if (seat.lockedBy === userId) {
            seat.isLocked = false;
            seat.lockedBy = null;
            seat.lockedAt = null;
            await theatre.save();
        }
        
        res.status(200).json({
            success: true,
            message: 'Seat unlocked'
        });
    } catch (error) {
        console.error('Unlock seat error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Book seat (permanent booking)
const bookSeat = async (req, res) => {
    try {
        const { screenId, seatId } = req.params;
        const { userId } = req.body;
        
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        const screen = theatre.screens.id(screenId);
        
        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found'
            });
        }
        
        const seat = screen.seatLayout.seats.find(s => s.seatId === seatId);
        
        if (!seat) {
            return res.status(404).json({
                success: false,
                message: 'Seat not found'
            });
        }
        
        if (seat.isBooked) {
            return res.status(400).json({
                success: false,
                message: 'Seat is already booked'
            });
        }
        
        seat.isBooked = true;
        seat.isLocked = false;
        seat.lockedBy = null;
        seat.lockedAt = null;
        seat.bookedBy = userId;
        seat.bookedAt = new Date();
        
        await theatre.save();
        
        res.status(200).json({
            success: true,
            data: seat,
            message: 'Seat booked successfully'
        });
    } catch (error) {
        console.error('Book seat error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get available seats
const getAvailableSeats = async (req, res) => {
    try {
        const { screenId } = req.params;
        
        const theatre = await Theatre.findOne({ ownerId: req.user.id });
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        const screen = theatre.screens.id(screenId);
        
        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found'
            });
        }
        
        // Clean up expired locks (older than 10 minutes)
        const now = new Date();
        let expiredCount = 0;
        
        screen.seatLayout.seats.forEach(seat => {
            if (seat.isLocked && seat.lockedAt) {
                const lockTime = new Date(seat.lockedAt);
                const diffMinutes = (now - lockTime) / 1000 / 60;
                if (diffMinutes >= 10) {
                    seat.isLocked = false;
                    seat.lockedBy = null;
                    seat.lockedAt = null;
                    expiredCount++;
                }
            }
        });
        
        if (expiredCount > 0) {
            await theatre.save();
        }
        
        const availableSeats = screen.seatLayout.seats.filter(seat => !seat.isBooked);
        
        res.status(200).json({
            success: true,
            data: {
                totalSeats: screen.seatLayout.totalSeats,
                availableSeats: availableSeats.length,
                bookedSeats: screen.seatLayout.seats.filter(s => s.isBooked).length,
                lockedSeats: screen.seatLayout.seats.filter(s => s.isLocked && !s.isBooked).length,
                seats: screen.seatLayout.seats.map(seat => ({
                    seatId: seat.seatId,
                    row: seat.row,
                    number: seat.number,
                    type: seat.type,
                    price: seat.price,
                    isBooked: seat.isBooked,
                    isLocked: seat.isLocked
                }))
            }
        });
    } catch (error) {
        console.error('Get available seats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ==================== EXPORTS ====================

module.exports = {
    // Public
    getCities,
    // Theatre
    createTheatre,
    getMyTheatre,
    updateTheatre,
    deleteTheatre,
    // Screen
    addScreen,
    getScreens,
    getScreenById,
    updateScreen,
    deleteScreen,
    // Seat Layout
    saveSeatLayout,
    getSeatLayout,
    // Seat Booking/Locking
    lockSeat,
    unlockSeat,
    bookSeat,
    getAvailableSeats
};