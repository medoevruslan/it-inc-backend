import { Request, Response } from 'express';
import { OutputBlogType } from '../input-output-types/blog-types';
import { blogRepository } from '../repository';
import { ObjectId } from 'mongodb';

export const getBlogByIdController = async (req: Request<{ id: string }>, res: Response<OutputBlogType>) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).send();
    return;
  }

  const found = await blogRepository.findById(req.params.id);

  if (found === null) {
    res.status(404).send();
    return;
  }

  res.send(found);
};
