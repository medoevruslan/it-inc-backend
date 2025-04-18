import { Request, Response } from 'express';
import { db } from '../db/db';
import { InputPostType, PostType } from '../input-output-types/post-types';
import { postRepository } from '../repository';
import { ObjectId } from 'mongodb';
import { postService } from '../service/postService';
export const updatePostController = async (req: Request<{ id: string }, {}, PostType>, res: Response) => {
  try {
    await postService.update({ postId: req.params.id, update: req.body });
    res.status(204).send();
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
