const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/keys'); // Import JWT secret key

const authenticate = (req, res, next) => {
    const token = req.headers.authorization; // Expecting `Authorization: Bearer <token>`
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY); // Verify token
        req.user = decoded; // Attach decoded token data (e.g., email) to the request
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = authenticate;
