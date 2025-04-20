import { Request, Response } from 'express';
import { OutputPostType, PostType } from '../input-output-types/post-types';
import { postService } from '../service/postService';
import { GetAllQueryParams } from '../shared/types';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';
import { handleApiError } from '../shared/utils';
import { HttpStatuses } from '../shared/enums';

export const getPostsController = async (
  req: Request<{}, {}, {}, GetAllQueryParams<PostType>>,
  res: Response<OutputModelTypeWithInfo<OutputPostType>>,
) => {
  try {
    const posts = await postService.findAll(req.query);
    res.status(HttpStatuses.Success).send(posts);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};
