import { Request, Response } from 'express';
import { InputPostType } from '../input-output-types/post-types';
import { postService } from '../service/postService';

export const createPostByBlogByIdController = async (
  req: Request<{ blogId: string }, {}, Omit<InputPostType, 'blogId'>>,
  res: Response,
) => {
  try {
    const post = await postService.create({ blogId: req.params.blogId, ...req.body });
    res.status(201).send(post);
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
