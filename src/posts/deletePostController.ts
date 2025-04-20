import { Request, Response } from 'express';
import { postRepository } from '../repository';
import { ObjectId } from 'mongodb';
import { postService } from '../service/postService';
import { handleApiError } from '../shared/utils';

export const deletePostController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    await postService.deleteById(req.params.id);
    res.status(204).send();
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};
