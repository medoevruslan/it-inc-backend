import { Request, Response } from 'express';
import { InputPostType, OutputPostType } from '../input-output-types/post-types';
import { postService } from '../service/postService';
import { handleApiError } from '../shared/utils';

export const createPostController = async (req: Request<{}, {}, InputPostType>, res: Response) => {
  try {
    const createdPost = await postService.create(req.body);
    res.status(201).send(createdPost);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};
