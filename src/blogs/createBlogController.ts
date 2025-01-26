import { Request, Response } from 'express';
import { InputBlogType, OutputBlogType } from '../input-output-types/blog-types';
import { blogRepository } from '../repository';

export const createBlogController = async (req: Request<{}, {}, InputBlogType>, res: Response<OutputBlogType>) => {
  const createdId = await blogRepository.create({
    ...req.body,
    createdAt: new Date().toISOString(),
    isMembership: false,
  });

  const createdBlog = await blogRepository.findById(createdId);

  if (!createdBlog) {
    res.status(400).send();
    return;
  }

  res.status(201).send(createdBlog);
};
