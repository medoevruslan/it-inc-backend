import mongoose, { model } from 'mongoose';
import { SETTINGS } from '../settings';
import { DeviceAuthSessionsDbType } from '../db/device-auth-sessions-db-type';

const deviceAuthSessionsDbSchema = new mongoose.Schema({
  iat: Number,
  deviceId: String,
  ip: String,
  deviceName: String,
  userId: String,
  exp: Number
})

export const DeviceAuthSessionsDbModel = model<DeviceAuthSessionsDbType>(SETTINGS.TABLE.DEVICE_AUTH_SESSIONS, deviceAuthSessionsDbSchema)