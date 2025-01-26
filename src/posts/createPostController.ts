import { Request, Response } from 'express';
import { InputPostType, OutputPostType } from '../input-output-types/post-types';
import { blogRepository, postRepository } from '../repository';
import { ObjectId } from 'mongodb';
import { postCollection } from '../db/mongoDb';

export const createPostController = async (req: Request<{}, {}, InputPostType>, res: Response<OutputPostType>) => {
  const foundBlog = await blogRepository.findById(req.body.blogId);

  if (!foundBlog) {
    res.status(404).send();
    return;
  }

  const createdId = await postRepository.create({
    ...req.body,
    blogName: foundBlog.name,
    createdAt: new Date().toISOString(),
  });

  const createdPost = await postRepository.findById(createdId);

  if (!createdPost) {
    res.status(400).send();
    return;
  }

  res.status(201).send(createdPost);
};
