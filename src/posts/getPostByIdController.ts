import { Request, Response } from 'express';
import { OutputPostType } from '../input-output-types/post-types';
import { postRepository } from '../repository';
import { ObjectId } from 'mongodb';

export const getPostByIdController = async (req: Request<{ id: string }>, res: Response<OutputPostType>) => {
  const postId = req.params.id;

  if (!ObjectId.isValid(postId)) {
    res.status(400).send();
    return;
  }

  const found = await postRepository.findById(postId);

  if (!found) {
    res.status(404).send();
    return;
  }

  res.send(found);
};
