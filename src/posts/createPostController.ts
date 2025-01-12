import { Request, Response } from 'express';
import { BlogDbType } from '../db/blog-db-type';
import { PostDbType } from '../db/post-db.type';
import { InputPostType } from '../input-output-types/post-types';
import { generateIdString } from '../shared/utils';
import { db } from '../db/db';
import { postRepository } from '../repository';
export const createPostController = async (req: Request<{}, {}, InputPostType>, res: Response) => {
  const created = await postRepository.create(req.body);
  res.status(201).send(created);
};
