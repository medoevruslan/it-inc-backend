import { Request, Response } from 'express';
import { InputPostType, OutputPostType } from '../input-output-types/post-types';
import { postService } from '../service/postService';

export const createPostController = async (req: Request<{}, {}, InputPostType>, res: Response) => {
  try {
    const createdPost = await postService.create(req.body);
    res.status(201).send(createdPost);
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
