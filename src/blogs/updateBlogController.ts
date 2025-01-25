import { Request, Response } from 'express';
import { InputBlogType } from '../input-output-types/blog-types';
import { blogRepository } from '../repository';
import { ObjectId } from 'mongodb';

export const updateBlogController = async (req: Request<{ id: string }, {}, InputBlogType>, res: Response) => {
  const blogId = req.params.id;

  if (!ObjectId.isValid(blogId)) {
    res.status(400).send();
    return;
  }

  const success = await blogRepository.update({ blogId, update: req.body });

  if (!success) {
    res.status(404).send();
    return;
  }

  res.status(204).send();
};
