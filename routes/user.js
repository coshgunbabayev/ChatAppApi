import { Router } from 'express';
let router = new Router();

import {
    createUser
} from '../controllers/user.js';

import authenticate from '../middlewares/authenticate.js';

router.route('/signup')
    .post(createUser);

export default router;