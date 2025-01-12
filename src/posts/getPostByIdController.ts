import { Request, Response } from 'express';
import { OutputPostType } from '../input-output-types/post-types';
import { postRepository } from '../repository';

export const getPostByIdController = async (req: Request<{ id: string }>, res: Response<OutputPostType>) => {
  const found = await postRepository.findById(req.params.id);

  if (!found) {
    res.status(404).send();
    return;
  }

  res.send(found);
};
