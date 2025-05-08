import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { handleApiError } from '../shared/utils';
import { commentQueryRepository } from '../repository/commentQueryRepository';
import { GetAllQueryParams } from '../shared/types';
import { PostType } from '../input-output-types/post-types';
import { CommentType } from '../input-output-types/comment-types';

export const getPostCommentsController =  async (req: Request<{postId: string}, {}, {}, GetAllQueryParams<CommentType>>, res: Response) => {
  try {
    const comments = await commentQueryRepository.findByPostId(req.params.postId, req.query);
    res.status(HttpStatuses.Success).send(comments);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};
