import { BlogDbType } from '../db/blog-db-type';
import { OptionalUnlessRequiredId } from 'mongodb';

export type InputBlogType = OptionalUnlessRequiredId<BlogDbType>;
export type UpdateBlogType = Omit<InputBlogType, '_id'>;

// Represents the output when sending data to client
export type OutputBlogType = Omit<BlogDbType, '_id'> & { id: string };
