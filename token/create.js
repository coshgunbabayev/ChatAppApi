import jwt from 'jsonwebtoken';

function verificationToken (id) {
    return jwt.sign({ userId }, process.env.JWT_SECRET_VERIFICATION, {
        expiresIn: "1h"
    });
}

function loginToken(id) {
    return jwt.sign({ userId }, process.env.JWT_SECRET_LOGIN, {
        expiresIn: "30d"
    });
};

export {
    verificationToken,
    loginToken
};