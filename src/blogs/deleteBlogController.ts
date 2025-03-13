import { Request, Response } from 'express';
import { blogService } from '../service/blogService';

export const deleteBlogController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    await blogService.deleteById(req.params.id);
    res.status(204).send();
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
