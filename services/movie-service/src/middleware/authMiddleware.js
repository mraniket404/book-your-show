const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('🔐 [MOVIE] Verifying token...');
            
            // Verify JWT and decode
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('🔐 [MOVIE] Decoded token:', decoded);
            
            // Set user from decoded token
            req.user = {
                id: decoded.id,
                role: decoded.role || 'user'
            };
            
            console.log('✅ [MOVIE] User authenticated:', req.user);
            next();
            
        } catch (error) {
            console.error('❌ [MOVIE] Auth error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
    } else {
        console.error('❌ [MOVIE] No token provided');
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }
};

const distributor = (req, res, next) => {
    console.log('🔐 [MOVIE] Checking role. User role:', req.user?.role);
    
    if (req.user && (req.user.role === 'distributor' || req.user.role === 'admin')) {
        console.log('✅ [MOVIE] Distributor access granted');
        next();
    } else {
        console.log('❌ [MOVIE] Distributor access denied. Role:', req.user?.role);
        return res.status(403).json({
            success: false,
            message: 'Access denied. Distributor only.'
        });
    }
};

module.exports = { protect, distributor };