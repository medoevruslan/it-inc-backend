import { Request, Response } from 'express';
import { BlogType } from '../input-output-types/blog-types';
import { blogService } from '../service/blogService';
import { GetAllQueryParams } from '../shared/types';

export const getBlogsController = async (req: Request<{}, {}, {}, GetAllQueryParams<BlogType>>, res: Response) => {
  try {
    const blogs = await blogService.findAll(req.query);
    res.send(blogs);
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
