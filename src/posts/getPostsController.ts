import { Request, Response } from 'express';
import { db } from '../db/db';
import { PostDbType } from '../db/post-db.type';
import { postRepository } from '../repository';
import { OutputPostType } from '../input-output-types/post-types';
export const getPostsController = async (req: Request, res: Response<OutputPostType[]>) => {
  const posts = await postRepository.findAll();

  res.status(200).send(posts);
};
