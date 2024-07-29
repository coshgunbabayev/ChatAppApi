import jwt from 'jsonwebtoken';

import User from '../models/userModel.js';

async function authenticate(req, res, next) {
    const { token } = req.cookies;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'User not authenticated'
        });
    };

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'User not authenticated'
        });
    };

    let user;
    try {
        user = await User.findById(decoded.userId);
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'User not authenticated'
        });
    }

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'User not authenticated'
        });
    };

    req.user = user;
    next();
};

export default authenticate