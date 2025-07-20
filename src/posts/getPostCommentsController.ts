import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { handleApiError } from '../shared/utils';
import { commentQueryRepository } from '../repository/commentQueryRepository';
import { GetAllQueryParams } from '../shared/types';
import { CommentType } from '../input-output-types/comment-types';
import { commentService } from '../service/commentService';

export const getPostCommentsController =  async (req: Request<{postId: string}, {}, {}, GetAllQueryParams<CommentType>>, res: Response) => {
  try {
    console.log(`get by post id: ${req.params.postId} comments`)
    const comments = await commentService.findByPostId(req.params.postId, req.query);
    console.log(`found comments: ${JSON.stringify(comments)}`)
    res.status(HttpStatuses.Success).send(comments);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};
