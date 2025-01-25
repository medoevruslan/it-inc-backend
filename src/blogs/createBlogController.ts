import { Request, Response } from 'express';
import { InputBlogType } from '../input-output-types/blog-types';
import { blogRepository } from '../repository';

export const createBlogController = async (req: Request<{}, {}, InputBlogType>, res: Response<{ id: string }>) => {
  const created = await blogRepository.create({
    ...req.body,
    createdAt: new Date().toISOString(),
    isMembership: false,
  });
  res.status(201).send({ id: created });
};
