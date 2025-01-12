import { Request, Response } from 'express';
import { db } from '../db/db';
export const deletePostController = (req: Request<{ postId: string }>, res: Response) => {
  const postId = req.params.postId;

  const foundIndex = db.posts.findIndex((post) => post.id === postId);

  if (foundIndex < 0) {
    res.status(404).send();
    return;
  }

  db.posts.splice(foundIndex, 1);
  res.status(204).send();
};
