import { Request, Response } from 'express';
import { db } from '../db/db';
import { PostDbType } from '../db/post-db.type';
import { postRepository } from '../repository';
export const getPostsController = async (req: Request, res: Response<PostDbType[]>) => {
  const posts = await postRepository.findAll();

  res.status(200).send(posts);
};
