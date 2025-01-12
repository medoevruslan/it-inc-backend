import { Request, Response } from 'express';
import { db } from '../db/db';
import { PostInputType } from '../input-output-types/post-types';
export const updatePostController = (req: Request<{ postId: string }, {}, PostInputType>, res: Response) => {
  const postId = req.params.postId;

  const foundIndex = db.posts.findIndex((post) => post.id === postId);

  if (foundIndex < 0) {
    res.status(404).send();
    return;
  }

  const newPostData = req.body;

  db.posts[foundIndex] = { id: postId, ...newPostData, blogName: newPostData?.blogName ?? null };
  res.status(204).send();
};
