import { Request, Response } from 'express';
import { commentQueryRepository } from '../repository/commentQueryRepository';
export const getCommentsController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const comments = await commentQueryRepository.findById(req.params.id);
    res.status(200).send(comments);
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
