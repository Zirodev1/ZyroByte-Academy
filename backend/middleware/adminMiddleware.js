const jwt = require('jsonwebtoken');
const User = require('../models/User')

const admin = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if(user && user.role === 'admin') {
            req.user = user;
            next();
        } else {
            res.status(403).json({ message: "Admin access required"});
        }
    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
}

module.exports = admin;