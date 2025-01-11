import { Request, Response } from 'express';
import { db } from '../db/db';
import { PostDbType } from '../db/post-db.type';
export const getPostsController = (req: Request, res: Response<PostDbType[]>) => {
  const posts = db.posts;

  res.status(200).send(posts);
};
