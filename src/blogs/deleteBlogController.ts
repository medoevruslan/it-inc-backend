import { Request, Response } from 'express';
import { db } from '../db/db';
export const deleteBlogController = (req: Request<{ blogId: string }>, res: Response) => {
  const blogId = req.params.blogId;

  const foundIndex = db.blogs.findIndex((blog) => blog.id === blogId);

  if (foundIndex < 0) {
    res.status(404).send();
    return;
  }

  db.blogs.splice(foundIndex, 1);
  res.status(204).send();
};
