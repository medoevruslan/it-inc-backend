import mongoose, { model } from 'mongoose';
import { SETTINGS } from '../settings';
import { ApiRequestsDataDbType } from '../db/api-requests-data-db-type';

const apiRequestsDataDbSchema = new mongoose.Schema({
  IP: String,
  URL: String,
  date: { type: Date, required: true, expires: 60 }
})

export const ApiRequestsDataDbModel = model<ApiRequestsDataDbType>(SETTINGS.TABLE.API_REQUESTS_DATA, apiRequestsDataDbSchema)