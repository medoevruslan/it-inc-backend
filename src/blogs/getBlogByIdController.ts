import { Request, Response } from 'express';
import { OutputBlogType } from '../input-output-types/blog-types';
import { blogRepository } from '../repository';

export const getBlogByIdController = async (req: Request<{ id: string }>, res: Response<OutputBlogType>) => {
  const found = await blogRepository.findById(req.params.id);

  if (found === null) {
    res.status(404).send();
    return;
  }

  res.send(found);
};
