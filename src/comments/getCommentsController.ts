import { Request, Response } from 'express';
import { commentQueryRepository } from '../repository/commentQueryRepository';
import { handleApiError } from '../shared/utils';
export const getCommentsController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    console.log(`get comment by id: ${req.params.id}`)
    const comments = await commentQueryRepository.findById(req.params.id);
    res.status(200).send(comments);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};
