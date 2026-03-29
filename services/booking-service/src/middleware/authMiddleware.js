const jwt = require('jsonwebtoken');
const axios = require('axios');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/mraniket404/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            req.user = response.data.data;
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
    }
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protect };