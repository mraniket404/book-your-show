const Theatre = require('../models/Theatre');

/**
 * @desc    Register new theatre (Theatre Owner)
 * @route   POST /api/theatres/owner/register
 * @access  Private (Theatre Owner)
 */
const registerTheatre = async (req, res) => {
    try {
        const {
            name,
            city,
            address,
            amenities,
            contactNumber,
            email,
            seatLayout
        } = req.body;

        const ownerId = req.user.id;

        // Check if theatre already exists
        const existingTheatre = await Theatre.findOne({
            name,
            city,
            ownerId
        });

        if (existingTheatre) {
            return res.status(400).json({
                success: false,
                message: 'You already have a theatre with this name in this city'
            });
        }

        const theatre = await Theatre.create({
            ownerId,
            name,
            city,
            address,
            amenities,
            contactNumber,
            email,
            seatLayout: seatLayout || { rows: 0, columns: 0, seats: [], customDesign: false },
            isVerified: false
        });

        res.status(201).json({
            success: true,
            message: 'Theatre registered successfully. Waiting for verification.',
            data: theatre
        });

    } catch (error) {
        console.error('Register theatre error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get owner's theatres
 * @route   GET /api/theatres/owner/my-theatres
 * @access  Private
 */
const getMyTheatres = async (req, res) => {
    try {
        const theatres = await Theatre.find({ 
            ownerId: req.user.id,
            isActive: true
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: theatres.length,
            data: theatres
        });

    } catch (error) {
        console.error('Get my theatres error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Create custom seat layout
 * @route   POST /api/theatres/owner/:theatreId/layout
 * @access  Private
 */
const createCustomLayout = async (req, res) => {
    try {
        const { theatreId } = req.params;
        const { rows, columns, customSeats, sections, backgroundImage } = req.body;

        const theatre = await Theatre.findOne({
            _id: theatreId,
            ownerId: req.user.id
        });

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found or you are not the owner'
            });
        }

        let seats = [];

        if (customSeats && customSeats.length > 0) {
            // Custom layout
            seats = customSeats.map(seat => ({
                row: seat.row,
                number: seat.number,
                seatId: `${seat.row}${seat.number}`,
                type: seat.type || 'normal',
                price: seat.price || 200,
                position: { x: seat.x || 0, y: seat.y || 0 },
                isAccessible: seat.isAccessible || false
            }));
        } else {
            // Auto-generate grid layout
            for (let i = 0; i < rows; i++) {
                const rowLetter = String.fromCharCode(65 + i);
                
                for (let j = 0; j < columns; j++) {
                    let price = 200;
                    let type = 'normal';
                    
                    if (i >= rows - 2) {
                        price = 350;
                        type = 'premium';
                    }
                    
                    if (i === rows - 1 && j < 4) {
                        price = 500;
                        type = 'recliner';
                    }
                    
                    seats.push({
                        row: rowLetter,
                        number: j + 1,
                        seatId: `${rowLetter}${j + 1}`,
                        type,
                        price,
                        position: { x: j * 50, y: i * 50 },
                        isAccessible: false
                    });
                }
            }
        }

        theatre.seatLayout = {
            rows: rows || theatre.seatLayout.rows,
            columns: columns || theatre.seatLayout.columns,
            seats: seats,
            customDesign: true,
            sections: sections || [],
            backgroundImage: backgroundImage || ''
        };
        
        theatre.totalSeats = seats.length;
        await theatre.save();

        res.status(200).json({
            success: true,
            message: 'Seat layout created successfully',
            data: {
                totalSeats: theatre.totalSeats,
                seatLayout: theatre.seatLayout
            }
        });

    } catch (error) {
        console.error('Create layout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Update seats
 * @route   PUT /api/theatres/owner/:theatreId/seats
 * @access  Private
 */
const updateSeats = async (req, res) => {
    try {
        const { theatreId } = req.params;
        const { seats } = req.body;

        const theatre = await Theatre.findOne({
            _id: theatreId,
            ownerId: req.user.id
        });

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }

        theatre.seatLayout.seats = seats;
        theatre.totalSeats = seats.length;
        await theatre.save();

        res.status(200).json({
            success: true,
            message: 'Seats updated successfully',
            data: {
                totalSeats: theatre.totalSeats,
                seats: theatre.seatLayout.seats
            }
        });

    } catch (error) {
        console.error('Update seats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Update theatre details
 * @route   PUT /api/theatres/owner/:theatreId
 * @access  Private
 */
const updateTheatre = async (req, res) => {
    try {
        const { theatreId } = req.params;
        const updates = req.body;

        const theatre = await Theatre.findOneAndUpdate(
            { _id: theatreId, ownerId: req.user.id },
            updates,
            { new: true, runValidators: true }
        );

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
        console.error('Update theatre error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Get layout for owner editing
 * @route   GET /api/theatres/owner/:theatreId/layout/edit
 * @access  Private
 */
const getLayoutForEdit = async (req, res) => {
    try {
        const { theatreId } = req.params;

        const theatre = await Theatre.findOne({
            _id: theatreId,
            ownerId: req.user.id
        });

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                theatreName: theatre.name,
                totalSeats: theatre.totalSeats,
                seatLayout: theatre.seatLayout,
                amenities: theatre.amenities
            }
        });

    } catch (error) {
        console.error('Get layout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Add show to theatre
 * @route   POST /api/theatres/owner/:theatreId/shows
 * @access  Private
 */
const addShow = async (req, res) => {
    try {
        const { theatreId } = req.params;
        const { movieId, date, time, language, format, priceMap } = req.body;

        const theatre = await Theatre.findOne({
            _id: theatreId,
            ownerId: req.user.id
        });

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Show data prepared',
            data: {
                movieId,
                theatreId,
                date,
                time,
                language,
                format,
                priceMap: priceMap || {
                    normal: 200,
                    premium: 350,
                    recliner: 500
                },
                totalSeats: theatre.totalSeats
            }
        });

    } catch (error) {
        console.error('Add show error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    registerTheatre,
    getMyTheatres,
    createCustomLayout,
    updateSeats,
    updateTheatre,
    getLayoutForEdit,
    addShow
};