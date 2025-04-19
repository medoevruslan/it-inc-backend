import { Request, Response } from 'express';
import { CommentUpdateType } from '../input-output-types/comment-types';
import { commentService } from '../service/commentService';
export const putCommentsController = async (
  req: Request<{ commentId: string }, {}, CommentUpdateType['update']>,
  res: Response,
) => {
  try {
    await commentService.update({ commentId: req.params.commentId, update: req.body });
    res.sendStatus(204);
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
