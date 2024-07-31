import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';
import validator from 'validator';
import bcrypt from 'bcryptjs';

import {
    createCode
} from '../tools/random.js';

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name area is required'],
    },

    surname: {
        type: String,
        required: [true, 'surname area is required'],
    },

    username: {
        type: String,
        required: [true, 'username area is required'],
        unique: true,
        validate: [
            function (value) {
                return validator.isAlphanumeric(value) && /^\S*$/.test(value);
            },
            'uername must be alphanumeric and should not contain spaces.'
        ]
    },

    email: {
        type: String,
        required: [true, 'email area is required'],
        unique: true,
        validate: [validator.isEmail, 'email is not valid'],
    },

    password: {
        type: String,
        required: [true, 'password area is required']
    },

    verification: {
        status: {
            type: Boolean,
            default: false,
        },

        code: {
            type: String,
            default: createCode(6)
        }
    },

    bio: {
        type: String,
        maxLength: [120, 'bio is so long, max length is 120'],
        default: "",
    },

    profilePicture: {
        type: String,
        default: ''
    },

    profilePictureId: {
        type: String,
        default: ''
    },
},
    {
        timestamps: true
    });

const User = mongoose.model("User", userSchema);

export default User;