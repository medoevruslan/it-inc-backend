import mongoose, { model } from 'mongoose';
import { PostDbType } from '../db/post-db.type';
import { SETTINGS } from '../settings';

const postSchema = new mongoose.Schema({
    title: { type: String, required: true, maxLength: 30 },
    shortDescription: { type: String, required: true, maxLength: 100 },
    content: { type: String, required: true, maxLength: 1000 },
    blogId: { type: String, required: true },
    blogName: String,
  },
  { timestamps: true });

export const PostModel = model<PostDbType>(SETTINGS.TABLE.POSTS, postSchema);