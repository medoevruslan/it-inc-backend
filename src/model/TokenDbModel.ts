import mongoose, { model } from 'mongoose';
import { TokenDbType } from '../db/token-db-type';
import { SETTINGS } from '../settings';

const tokenDbSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true }
})

export const TokenDbModel = model<TokenDbType>(SETTINGS.TABLE.REFRESH_TOKENS_BLOCKED, tokenDbSchema)