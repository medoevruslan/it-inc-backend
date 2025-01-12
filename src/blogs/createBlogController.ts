import { Request, Response } from 'express';
import { BlogDbType } from '../db/blog-db-type';
import { BlogInputType } from '../input-output-types/blog-types';
import { generateIdString } from '../shared/utils';
import { db } from '../db/db';
export const createBlogController = (req: Request<{}, {}, BlogInputType>, res: Response<BlogDbType>) => {
  const newBlog: BlogDbType = { id: generateIdString(), ...req.body };

  db.blogs.push(newBlog);

  res.status(201).send(newBlog);
};
