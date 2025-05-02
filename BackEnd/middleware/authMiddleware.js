const jwt = require('jsonwebtoken');
const secret = JWT_SECRET;

function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const validToken = token.split(' ')[1]; // Bearer <token>
        const decoded = jwt.verify(validToken, secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}

module.exports = authMiddleware;
