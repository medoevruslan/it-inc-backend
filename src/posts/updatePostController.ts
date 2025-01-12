import { Request, Response } from 'express';
import { db } from '../db/db';
import { InputPostType } from '../input-output-types/post-types';
import { postRepository } from '../repository';
export const updatePostController = async (req: Request<{ postId: string }, {}, InputPostType>, res: Response) => {
  const postId = req.params.postId;

  const success = await postRepository.update({ postId, update: req.body });

  if (!success) {
    res.status(404).send();
    return;
  }

  res.status(204).send();
};
