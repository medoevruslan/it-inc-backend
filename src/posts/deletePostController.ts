import { Request, Response } from 'express';
import { postRepository } from '../repository';
import { ObjectId } from 'mongodb';
import { postService } from '../service/postService';

export const deletePostController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    await postService.deleteById(req.params.id);
    res.status(204).send();
  } catch (err: unknown) {
    const error = err as Error;
    const errorCode = Number(error.message);
    if (!isNaN(errorCode)) {
      res.status(errorCode).send();
    } else {
      res.status(500).send(error.message);
    }
  }
};
