import { Request, Response } from 'express';
import { InputBlogType } from '../input-output-types/blog-types';
import { blogService } from '../service/blogService';

export const createBlogController = async (req: Request<{}, {}, InputBlogType>, res: Response) => {
  try {
    const createdBlog = await blogService.create(req.body);
    res.status(201).send(createdBlog);
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
