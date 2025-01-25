import { Request, Response } from 'express';
import { db } from '../db/db';
import { InputPostType } from '../input-output-types/post-types';
import { postRepository } from '../repository';
import { ObjectId } from 'mongodb';
export const updatePostController = async (req: Request<{ id: string }, {}, InputPostType>, res: Response) => {
  const postId = req.params.id;

  if (!ObjectId.isValid(postId)) {
    res.status(400).send();
    return;
  }
  const success = await postRepository.update({ postId, update: req.body });

  if (!success) {
    res.status(404).send();
    return;
  }

  res.status(204).send();
};
