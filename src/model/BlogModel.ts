import mongoose, { model } from 'mongoose';
import { SETTINGS } from '../settings';
import { BlogDbType } from '../db/blog-db-type';

const blogSchema = new mongoose.Schema({
    name: { type: String, required: true, maxLength: 15 },
    description: { type: String, required: true, maxLength: 500 },
    websiteUrl: {
      type: String,
      maxLength: 100,
      match: [
        /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/,
        'websiteUrl should be a valid HTTPS URL'
      ]
    },
    isMembership: { type: Boolean, default: false },
  },
  { timestamps: true });

export const BlogModel = model<BlogDbType>(SETTINGS.TABLE.BLOGS, blogSchema)