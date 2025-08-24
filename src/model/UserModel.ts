import mongoose, { model } from 'mongoose';
import { UserDbType, UserType } from '../db/user-db-type';
import { SETTINGS } from '../settings';

const userAccountSchema = new mongoose.Schema({
  login: {
    type: String,
    trim: true,
    required: [true, 'Login is required'],
    min: 3,
    max: 10,
    match: /^[a-zA-Z0-9_-]*$/,
  },
  password: { type: String, min: 6, max: 20 },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    required: [true, 'Email required'],
  },
  createdAt: { type: Date, default: Date.now() },
});

const emailConfirmationSchema = new mongoose.Schema({
  isConfirmed: Boolean,
  confirmationCode: String,
  expirationDate: Date,
});

const passwordRecoverySchema = new mongoose.Schema({
  recoveryCode: String,
  expirationDate: Date,
});

const userSchema = new mongoose.Schema({
  accountData: userAccountSchema,
  emailConfirmation: emailConfirmationSchema,
  passwordRecovery: { type: passwordRecoverySchema, required: false },
});

export const UserModel = model<UserDbType>(SETTINGS.TABLE.USERS, userSchema);