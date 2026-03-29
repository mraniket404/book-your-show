// Helper functions for seat layout designer

const generateGridLayout = (rows, columns, seatTypes) => {
    const seats = [];
    
    for (let i = 0; i < rows; i++) {
        const rowLetter = String.fromCharCode(65 + i);
        
        for (let j = 0; j < columns; j++) {
            // Determine seat type based on position
            let type = 'normal';
            let price = 200;
            
            if (seatTypes && seatTypes[rowLetter]) {
                type = seatTypes[rowLetter][j] || 'normal';
                price = getPriceForType(type);
            } else {
                // Default logic
                if (i >= rows - 2) {
                    type = 'premium';
                    price = 350;
                }
                if (i === rows - 1 && j < 4) {
                    type = 'recliner';
                    price = 500;
                }
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
    
    return seats;
};

const getPriceForType = (type) => {
    const prices = {
        normal: 200,
        premium: 350,
        recliner: 500,
        vip: 800,
        couple: 450
    };
    return prices[type] || 200;
};

const validateSeatLayout = (seats) => {
    const seatIds = new Set();
    const errors = [];
    
    for (const seat of seats) {
        if (seatIds.has(seat.seatId)) {
            errors.push(`Duplicate seat ID: ${seat.seatId}`);
        }
        seatIds.add(seat.seatId);
        
        if (!seat.row || !seat.number || !seat.seatId) {
            errors.push(`Invalid seat data: ${JSON.stringify(seat)}`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    generateGridLayout,
    getPriceForType,
    validateSeatLayout
};