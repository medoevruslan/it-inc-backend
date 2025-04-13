import { Request, Response } from 'express';
export const getCommentsController = (req: Request<{ id: string }>, res: Response) => {
  try {
    res.sendStatus(200);
  } catch (err: unknown) {}
};
