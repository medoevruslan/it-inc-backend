import { Request, Response } from 'express';
import { CommentUpdateType } from '../input-output-types/comment-types';
import { commentService } from '../service/commentService';
import { HttpStatuses } from '../shared/enums';
import { handleApiError } from '../shared/utils';
export const updateCommentsController = async (
  req: Request<{ id: string }, {}, CommentUpdateType['update']>,
  res: Response,
) => {
  try {
    console.log('update comment')
    await commentService.update(req.userId!, { commentId: req.params.id, update: req.body });
    res.sendStatus(204);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};
