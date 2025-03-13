import { Request, Response } from 'express';
import { InputBlogType, UpdateBlogType } from '../input-output-types/blog-types';
import { blogRepository } from '../repository';
import { ObjectId } from 'mongodb';
import { blogService } from '../service/blogService';

export const updateBlogController = async (
  req: Request<{ id: string }, {}, UpdateBlogType['update']>,
  res: Response,
) => {
  try {
    await blogService.update({ blogId: req.params.id, update: req.body });
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
