const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log('✅ [SHOW] User authenticated:', req.user.id, 'Role:', req.user.role);
            next();
        } catch (error) {
            console.error('❌ [SHOW] Auth error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, invalid token'
            });
        }
    } else {
        console.error('❌ [SHOW] No token provided');
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }
};

const isTheatreOwner = async (req, res, next) => {
    // Debug log
    console.log('🔐 [SHOW] isTheatreOwner - Role from token:', req.user?.role);
    
    // ✅ Check for both formats (to be safe)
    const isValid = req.user && (
        req.user.role === 'theatre-owner' || 
        req.user.role === 'theatre_owner'
    );
    
    if (isValid) {
        console.log('✅ [SHOW] Theatre owner verified - Role:', req.user.role);
        next();
    } else {
        console.error('❌ [SHOW] Access denied. Role:', req.user?.role, 'Expected: theatre-owner');
        return res.status(403).json({
            success: false,
            message: 'Access denied. Theatre owner only.'
        });
    }
};

module.exports = { protect, isTheatreOwner };