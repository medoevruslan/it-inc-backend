import { Request, Response } from 'express';
import { blogRepository } from '../repository';
import { OutputBlogType } from '../input-output-types/blog-types';

export const getBlogsController = async (req: Request, res: Response<OutputBlogType[]>) => {
  const blogs = await blogRepository.findAll();
  res.status(200).send(blogs);
};
