import { Request, Response } from 'express';
import { OutputPostTypeWithInfo, PostType } from '../input-output-types/post-types';
import { postService } from '../service/postService';
import { GetAllQueryParams } from '../shared/types';

export const getPostsController = async (
  req: Request<{}, {}, {}, GetAllQueryParams<PostType>>,
  res: Response<OutputPostTypeWithInfo>,
) => {
  const posts = await postService.findAll(req.query);
  res.status(200).send(posts);
};
