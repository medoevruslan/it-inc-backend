import { Request, Response } from 'express';
import { db } from '../db/db';
import { BlogInputType } from '../input-output-types/blog-types';

export const updateBlogController = (req: Request<{ blogId: string }, {}, BlogInputType>, res: Response) => {
  const blogId = req.params.blogId;

  const foundIndex = db.blogs.findIndex((blog) => blog.id === blogId);

  if (foundIndex < 0) {
    res.status(404).send();
    return;
  }

  db.blogs[foundIndex] = { id: blogId, ...req.body };
  res.status(204).send();
};
