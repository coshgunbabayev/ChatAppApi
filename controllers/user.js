import bcrypt from 'bcryptjs';

import User from '../models/userModel.js';

import {
    verificationToken,
    loginToken
} from '../token/create.js';

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

export {
    createUser
};