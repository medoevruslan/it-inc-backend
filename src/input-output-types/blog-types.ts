import { BlogDbType } from '../db/blog-db-type';

export type BlogInputType = Omit<BlogDbType, 'id'>;
