import jwt from 'jsonwebtoken';

function verificationToken (userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET_VERIFICATION, {
        expiresIn: "15m"
    });
};

function resetPasswordToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET_RESET_PASSWORD, {
        expiresIn: "15m"
    });
};

function loginToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET_LOGIN, {
        expiresIn: "30d"
    });
};

export {
    verificationToken,
    resetPasswordToken,
    loginToken
};