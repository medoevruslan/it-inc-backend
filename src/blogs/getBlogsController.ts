import { Request, Response } from 'express';
import { db } from '../db/db';
import { BlogDbType } from '../db/blog-db-type';
export const getBlogsController = (req: Request, res: Response<BlogDbType[]>) => {
  const blogs = db.blogs;

  res.status(200).send(blogs);
};
