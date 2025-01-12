import { BlogDbType } from '../db/blog-db-type';

export type InputBlogType = Omit<BlogDbType, 'id'>;
export type OutputBlogType = BlogDbType;
