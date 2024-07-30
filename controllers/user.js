import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import validator from 'validator';

import User from '../models/userModel.js';

import {
    verificationToken,
    resetPasswordToken,
    loginToken
} from '../token/create.js';

import {
    createCode
} from '../tools/random.js';

import {
    sendEmailForVerificationCode,
    sendEmailForResetPassword
} from '../smtp/email.js';

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

async function resetPasswordEmail(req, res) {
    const { email } = req.body;
    let errors = new Object();

    if (!email) {
        errors.email = 'email is required';
        return res.status(400).json({
            success: false,
            errors
        });
    };

    if (!validator.isEmail(email)) {
        errors.email = 'Invalid email format';
        return res.status(400).json({
            success: false,
            errors
        });
    };

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(200).json({
            success: true
        });
    };

    const token = resetPasswordToken(user._id);

    await sendEmailForResetPassword(user.email, token);

    res.status(200).json({
        success: true
    });
};

async function resetPasswordPassword(req, res) {
    const { token, password, repeatPassword } = req.body;
    let errors = new Object();

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'TokenError'
        });
    };

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_RESET_PASSWORD);
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

    if (!password || !repeatPassword) {
        if (!password) {
            errors.password = 'password is required';
        };

        if (!repeatPassword) {
            errors.repeatPassword = 'repeat password is required';
        };

        return res.status(400).json({
            success: false,
            errors
        });
    };

    if (password !== repeatPassword) {
        errors.repeatPassword = 'passwords do not match';
        return res.status(400).json({
            success: false,
            errors
        });
    };

    if (password.length < 8) {
        errors.password = 'password is not a valid  in length, at least 8 characters';
        return res.status(400).json({
            success: false,
            errors
        });
    };

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
        success: true
    });
};

async function loginUser(req, res) {
    const { username, password } = req.body;
    let errors = new Object();

    if (!username || !password) {
        if (!username) {
            errors.username = 'Username is required';
        };

        if (!password) {
            errors.password = 'Password is required';
        };

        return res.status(400).json({
            success: false,
            errors
        });
    };

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).render("login", {
            values: req.body,
            errors: { username: "Username is incorrect" }
        });
    };

    if (!user.verification.status) {
        return res.status(400).json({
            success: false,
            message: 'UserNotVerified'
        });
    };

    if (await bcrypt.compare(password, user.password)) {
        const token = await loginToken(user._id);

        res.cookie("token", token, {
            httpOnly: true
        });

        res.status(200).json({
            success: true
        });

    } else {
        return res.status(400).json({
            success: false,
            message: 'Password is incorrect'
        });
    };
};

export {
    createUser,
    verifyUser,
    resetPasswordEmail,
    resetPasswordPassword,
    loginUser
};