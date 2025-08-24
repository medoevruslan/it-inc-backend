import { BlogDbType } from '../db/blog-db-type';
import { OptionalUnlessRequiredId } from 'mongodb';

export type InputBlogType = Omit<BlogDbType, 'createdAt' | 'isMembership'>;
export type BlogType = Omit<BlogDbType, '_id'>;
export type UpdateBlogType = { blogId: string; update: BlogType };

// Represents the output when sending data to client
export type OutputBlogType = BlogType & { id: string };
