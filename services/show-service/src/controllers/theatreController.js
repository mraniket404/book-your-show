const Theatre = require('../models/Theatre');

const getTheatresByCity = async (req, res) => {
    try {
        const { city, movieId } = req.query;
        
        if (!city) {
            return res.status(400).json({
                success: false,
                message: 'City is required'
            });
        }
        
        let query = { 
            city, 
            isActive: true,
            isVerified: true
        };
        
        const theatres = await Theatre.find(query)
            .select('name address amenities images totalSeats contactNumber')
            .sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            count: theatres.length,
            data: theatres
        });

    } catch (error) {
        console.error('Get theatres error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getTheatreById = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id)
            .select('name address amenities images contactNumber email location');
        
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
        console.error('Get theatre error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getTheatreLayout = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id)
            .select('name seatLayout totalSeats');
        
        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }
        
        const layout = {
            theatreName: theatre.name,
            totalSeats: theatre.totalSeats,
            rows: theatre.seatLayout.rows,
            columns: theatre.seatLayout.columns,
            seats: theatre.seatLayout.seats.map(seat => ({
                seatId: seat.seatId,
                row: seat.row,
                number: seat.number,
                type: seat.type,
                price: seat.price,
                position: seat.position,
                isAccessible: seat.isAccessible
            })),
            sections: theatre.seatLayout.sections || [],
            customDesign: theatre.seatLayout.customDesign || false
        };
        
        res.status(200).json({
            success: true,
            data: layout
        });

    } catch (error) {
        console.error('Get theatre layout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getTheatresByCity,
    getTheatreById,
    getTheatreLayout
};