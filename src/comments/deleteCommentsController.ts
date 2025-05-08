import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { commentService } from '../service/commentService';
import { handleApiError } from '../shared/utils';
export const deleteCommentsController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    console.log('delete comment')
    await commentService.delete(req.userId!, req.params.id);
    console.log(`comment ${req.params.id} is deleted`)
    res.sendStatus(HttpStatuses.NoContent);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};
