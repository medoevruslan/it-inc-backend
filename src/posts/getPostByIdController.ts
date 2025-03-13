import { Request, Response } from 'express';
import { OutputPostType } from '../input-output-types/post-types';
import { postRepository } from '../repository';
import { ObjectId } from 'mongodb';
import { postService } from '../service/postService';

export const getPostByIdController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const found = await postService.findById(req.params.id);
    res.send(found);
  } catch (err: unknown) {
    const error = err as Error;
    const errorCode = Number(error.message);
    if (isFinite(errorCode)) {
      res.status(errorCode).send();
    } else {
      res.status(500).send(error.message);
    }
  }
};
