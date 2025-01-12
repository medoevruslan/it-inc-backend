import { Request, Response } from 'express';
import { BlogDbType } from '../db/blog-db-type';
import { InputBlogType } from '../input-output-types/blog-types';
import { blogRepository } from '../repository';
export const createBlogController = async (req: Request<{}, {}, InputBlogType>, res: Response<BlogDbType>) => {
  const created = await blogRepository.create(req.body);
  res.status(201).send(created);
};
