import { Request, Response } from 'express';
import { postRepository } from '../repository';
import { ObjectId } from 'mongodb';

export const deletePostController = async (req: Request<{ id: string }>, res: Response) => {
  const postId = req.params.id;

  if (!ObjectId.isValid(postId)) {
    res.status(400).send();
    return;
  }

  const success = await postRepository.deleteById(postId);

  if (!success) {
    res.status(404).send();
    return;
  }

  res.status(204).send();
};
