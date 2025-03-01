import { Request, Response } from 'express';
import { blogService } from '../service/blogService';

export const getBlogByIdController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const blog = await blogService.findById(req.params.id);
    res.send(blog);
  } catch (err: unknown) {
    const error = err as Error;
    const errorCode = Number(error.message);
    if (!isNaN(errorCode)) {
      res.status(errorCode).send();
    } else {
      res.status(500).send(error.message);
    }
  }
};
