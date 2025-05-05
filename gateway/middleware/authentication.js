// middleware/authentication.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Token mancante' }); // FINE, non chiamare next()
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token non valido' }); // FINE, non chiamare next()
        }

        req.user = user; // Se serve
        next(); // SOLO se tutto va bene
    });
}

module.exports = { authenticateToken };
