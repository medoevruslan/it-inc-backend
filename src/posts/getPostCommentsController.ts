import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { handleApiError } from '../shared/utils';
export const getPostCommentsController = (req: Request, res: Response) => {
  try {
    res.sendStatus(HttpStatuses.Success);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};
