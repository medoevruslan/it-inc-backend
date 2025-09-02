import mongoose, { model, Schema } from 'mongoose';
import { LikeType } from '../shared/enums';
import { SETTINGS } from '../settings';
import { LikesInfoDbType } from '../db/likes-info-db-type';

const likesInfoSchema = new mongoose.Schema({
    myStatus: { type: String, enum: Object.values(LikeType) },
    login: { type: String, required: true },
    authorId: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: SETTINGS.TABLE.COMMENTS, required: true }, // commentId, postId, etc. Foreign key
  },
  { timestamps: true });

export const LikeInfoModel = model<LikesInfoDbType>(SETTINGS.TABLE.LIKES_INFO, likesInfoSchema);