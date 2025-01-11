import { Request, Response } from 'express';
import { BlogDbType } from '../db/blog-db-type';
import { PostDbType } from '../db/post-db.type';
import { PostInputType } from '../input-output-types/post-types';
import { generateIdString } from '../shared/utils';
import { db } from '../db/db';
export const createPostController = (req: Request<{}, PostInputType>, res: Response) => {
  const { body } = req;

  const newPost: PostDbType = {
    id: generateIdString(),
    content: body.content,
    blogId: body.blogId,
    title: body.title,
    shortDescription: body.shortDescription,
    blogName: body?.blogName ?? null,
  };

  db.posts.push(newPost);

  res.status(201).send(newPost);
};
