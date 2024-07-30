import { Router } from 'express';
let router = new Router();

import {
    createUser,
    verifyUser,
    resetPasswordEmail,
    resetPasswordPassword,
    loginUser,
} from '../controllers/user.js';

import authenticate from '../middlewares/authenticate.js';

router.route('/signup')
    .post(createUser);

router.route('/verification')
    .post(verifyUser);

router.route('/reset-password/email')
    .post(resetPasswordEmail);

router.route('/reset-password/password')
    .post(resetPasswordPassword);

router.route('/login')
    .post(loginUser);

export default router;