import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { handleApiError } from '../shared/utils';
import { postService } from '../service/postService';
import { commentService } from '../service/commentService';

export const createPostCommentsController = async (
  req: Request<{ postId: string }, {}, { content: string }>,
  res: Response,
) => {
  try {
    await commentService.create({ userId: req.userId!, postId: req.params.postId, content: req.body.content });
    res.sendStatus(HttpStatuses.Created);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};
