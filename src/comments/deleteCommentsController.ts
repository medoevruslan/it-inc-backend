import { Request, Response } from 'express';
export const deleteCommentsController = (req: Request<{ commentId: string }>, res: Response) => {
  try {
    res.sendStatus(204);
  } catch (err: unknown) {}
};
