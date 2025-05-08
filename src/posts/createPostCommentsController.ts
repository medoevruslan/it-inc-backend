import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { handleApiError } from '../shared/utils';
import { commentService } from '../service/commentService';
import { commentQueryRepository } from '../repository/commentQueryRepository';

export const createPostCommentsController = async (
  req: Request<{ postId: string }, {}, { content: string }>,
  res: Response,
) => {
  try {
    const createdId =  await commentService.create({ userId: req.userId!, postId: req.params.postId, content: req.body.content });

    const foundComment = await commentQueryRepository.findById(createdId);

    res.status(HttpStatuses.Created).send(foundComment);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};
