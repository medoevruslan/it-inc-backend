import mongoose, { model } from 'mongoose';
import { PostDbType } from '../db/post-db.type';
import { SETTINGS } from '../settings';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 30 },
  shortDescription: { type: String, required: true, maxlength: 100 },
  content: { type: String, required: true, maxlength: 1000 },
  blogId: { type: String, required: true },
  blogName: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
})

export const PostModel = model<PostDbType>(SETTINGS.TABLE.POSTS, postSchema)