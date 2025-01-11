import { Request, Response } from 'express';
import { BlogDbType } from '../db/blog-db-type';
export const createBlogController = (req: Request<{}, BlogDbType>, res: Response) => {};
