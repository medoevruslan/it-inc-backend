import { Request, Response } from 'express';
import { blogRepository } from '../repository';
import { OutputBlogType } from '../input-output-types/blog-types';
import { blogService } from '../service/blogService';

export const getBlogsController = async (req: Request, res: Response) => {
  try {
    const blogs = await blogService.findAll();
    res.send(blogs);
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
