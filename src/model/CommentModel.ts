import mongoose, { model } from 'mongoose';
import { LikeType } from '../shared/enums';
import { SETTINGS } from '../settings';
import { CommentDbType } from '../db/comment-db-type';

const commentatorInfoSchema = new mongoose.Schema({
    userId: String,
    userLogin: String,
  },
  { _id: false });

const likesInfoSchema = new mongoose.Schema({
    likesCount: Number,
    dislikesCount: Number,
    myStatus: { type: String, enum: Object.values(LikeType) },
  },
  { _id: false });

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true, minLength: 20, maxLength: 300 },
  commentatorInfo: { type: commentatorInfoSchema },
  postId: String,
  likesInfo: likesInfoSchema,
}, { timestamps: true });


export const CommentModel = model<CommentDbType>(SETTINGS.TABLE.COMMENTS, commentSchema)