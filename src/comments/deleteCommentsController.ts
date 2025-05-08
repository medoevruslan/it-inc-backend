import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { commentService } from '../service/commentService';
export const deleteCommentsController = async (req: Request<{ commentId: string }>, res: Response) => {
  try {
    const isDeleted = await commentService.delete(req.params.commentId);
    if (!isDeleted) {
      res.sendStatus(HttpStatuses.NotFound);
      return
    }
    res.sendStatus(HttpStatuses.NoContent);
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
