const jwt = require('jsonwebtoken');
const axios = require('axios');

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/mraniket404/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userRole = response.data.data.role;
            if (!roles.includes(userRole)) {
                return res.status(403).json({ success: false, message: `Access denied. Required role: ${roles.join(' or ')}`, yourRole: userRole });
            }
            next();
        } catch (error) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
    };
};

module.exports = { verifyToken, checkRole };