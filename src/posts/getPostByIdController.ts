import { Request, Response } from 'express';
import { postService } from '../service/postService';
import { HttpStatuses } from '../shared/enums';

export const getPostByIdController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const found = await postService.findById(req.params.id);
    res.send(found);
  } catch (err: unknown) {
    const error = err as Error;
    const errorCode = Number(error.message);
    if (isFinite(errorCode)) {
      res.status(errorCode).send();
    } else {
      res.status(HttpStatuses.ServerError).send(error.message);
    }
  }
};
