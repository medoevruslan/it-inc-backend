import { Request, Response } from 'express';
import { blogService } from '../service/blogService';
import { PostType } from '../input-output-types/post-types';
import { GetAllQueryParams } from '../shared/types';

export const getPostsByBlogByIdController = async (
  req: Request<{ blogId: string }, {}, {}, GetAllQueryParams<PostType>>,
  res: Response,
) => {
  try {
    const posts = await blogService.findPostsByBlogId(req.params.blogId, req.query);
    res.send(posts);
  } catch (err: unknown) {
    const error = err as Error;
    const errorCode = Number(error.message);
    if (!isNaN(errorCode)) {
      res.status(errorCode).send();
    } else {
      res.status(500).send(error.message);
    }
  }
};
