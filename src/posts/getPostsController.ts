import { Request, Response } from 'express';
import { OutputPostType, PostType } from '../input-output-types/post-types';
import { postService } from '../service/postService';
import { GetAllQueryParams } from '../shared/types';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';

export const getPostsController = async (
  req: Request<{}, {}, {}, GetAllQueryParams<PostType>>,
  res: Response<OutputModelTypeWithInfo<OutputPostType>>,
) => {
  const posts = await postService.findAll(req.query);
  res.status(200).send(posts);
};
