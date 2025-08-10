import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { handleApiError } from '../shared/utils';
import { CommentUpdateType } from '../input-output-types/comment-types';
import { CommentService } from '../service/CommentService';
import { CommentQueryRepository } from '../repository/CommentQueryRepository';
import { inject } from 'inversify';

export class CommentsController {

  constructor(@inject(CommentService) protected commentService: CommentService, @inject(CommentQueryRepository) protected commentQueryRepository: CommentQueryRepository) {
  }

  async deleteComments(req: Request<{ id: string }>, res: Response) {
    try {
      console.log('delete comment');
      await this.commentService.delete(req.userId!, req.params.id);
      console.log(`comment ${req.params.id} is deleted`);
      res.sendStatus(HttpStatuses.NoContent);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  };

  async getComments(req: Request<{ id: string }>, res: Response) {
    try {
      console.log(`get comment by id: ${req.params.id}`);
      const comments = await this.commentQueryRepository.findById(req.params.id);
      res.status(200).send(comments);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  };

  async updateComments(
    req: Request<{ id: string }, {}, CommentUpdateType['update']>,
    res: Response,
  ) {
    try {
      console.log('update comment');
      await this.commentService.update(req.userId!, { commentId: req.params.id, update: req.body });
      res.sendStatus(204);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  };

}