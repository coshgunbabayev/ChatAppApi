import bcrypt from 'bcryptjs';

import User from '../models/userModel.js';

import {
    verificationToken,
    loginToken
} from '../token/create.js';

import {
    createCode
} from '../tools/random.js';

import { sendEmailForVerificationCode } from '../smtp/email.js';

async function createUser(req, res) {
    try {
        const { name, surname, username, email, password } = req.body;
        const user = await User.create({
            name,
            surname,
            username,
            email,
            password
        });

        await sendEmailForVerificationCode(user.email, user.verification.code);

        const token = verificationToken(user._id);

        res.status(201).json({
            success: true,
            token
        });
    } catch (err) {
        let errors = new Object();

        if (err.name === "ValidationError") {
            Object.keys(err.errors).forEach(key => {
                errors[key] = err.errors[key].message;
            });
        };

        if (err.name === "MongoServerError" && err.code === 11000) {
            if (err.keyPattern.username) {
                errors.username = 'username is used, try other username';
            };

            if (err.keyPattern.email) {
                errors.email = 'email is used, try other email';
            };
        };

        res.status(400).json({
            success: false,
            errors
        });
    };
};

async function verifyUser(req, res) {
    const { token, code } = req.body;
    let errors = new Object();

    if (!code) {
        errors.code = 'Verification code is required';
        return res.status(400).json({
            success: false,
            errors
        });
    };

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'TokenError'
        });
    };

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_VERIFICATION);
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'TokenError'
        });
    };

    let user;
    try {
        user = await User.findById(decoded.userId);
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'TokenError'
        });
    };

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'TokenError'
        });
    };

    if (user.verification.status) {
        return res.status(400).json({
            success: false,
            message: 'UserVerified'
        });
    };

    if (user.verification.code !== code) {
        const newCode = createCode(6)
        user.verification.code = newCode;
        await user.save();

        await sendEmailForVerificationCode(user.email, newCode);

        errors.code = 'Verification code is incorrect, we send a new verification code';
        return res.status(400).json({
            success: false,
            errors
        });
    };

    user.verification.status = true;
    user.verification.code = '';
    await user.save();

    res.status(200).json({
        success: true
    });
};

export {
    createUser,
    verifyUser
};