import { Request, Response } from 'express';
import { InputPostType } from '../input-output-types/post-types';
import { blogRepository, postRepository } from '../repository';
import { ObjectId } from 'mongodb';

export const createPostController = async (req: Request<{}, {}, InputPostType>, res: Response<{ id: string }>) => {
  const foundBlog = await blogRepository.findById(req.body.blogId);

  if (!foundBlog) {
    res.status(404).send();
    return;
  }

  const created = await postRepository.create({ ...req.body, blogName: foundBlog.name });

  res.status(201).send({ id: created });
};
