import { Router } from 'express';
let router = new Router();

import {
    createUser,
    verifyUser
} from '../controllers/user.js';

import authenticate from '../middlewares/authenticate.js';

router.route('/signup')
    .post(createUser);

router.route('/verification')
    .post(verifyUser);

export default router;