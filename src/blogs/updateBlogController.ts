import { Request, Response } from 'express';
import { InputBlogType } from '../input-output-types/blog-types';
import { blogRepository } from '../repository';

export const updateBlogController = async (req: Request<{ blogId: string }, {}, InputBlogType>, res: Response) => {
  const blogId = req.params.blogId;

  const success = await blogRepository.update({ blogId, update: req.body });

  if (!success) {
    res.status(404).send();
    return;
  }

  res.status(204).send();
};
