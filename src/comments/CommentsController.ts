import { Request, Response } from 'express';
import { HttpStatuses, LikeType, ResultStatus } from '../shared/enums';
import { handleApiError } from '../shared/utils';
import { CommentUpdateType } from '../input-output-types/comment-types';
import { CommentService } from '../service/CommentService';
import { CommentQueryRepository } from '../repository/CommentQueryRepository';
import { inject } from 'inversify';
import { jwtService } from '../composition-root';

export class CommentsController {

  constructor(
    @inject(CommentService) protected commentService: CommentService,
    @inject(CommentQueryRepository) protected commentQueryRepository: CommentQueryRepository,
  ) {
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

      let userId = '';

      // TODO: use middleware
      if (req.headers.authorization) {
        const [authType, token] = req.headers.authorization.split(' ');
        if (authType === 'Bearer') {
          const payload = await jwtService.verifyToken<{ userId: string }>(token);
          if (payload) {
            userId = payload.userId;
          }
        }
      }

      const comments = await this.commentQueryRepository.findById(req.params.id, userId);
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

  async updateCommentLikeStatus(
    req: Request<{ commentId: string }, {}, { likeStatus: LikeType }>,
    res: Response,
  ) {
    try {
      const commentId = req.params.commentId;
      const userId = req.userId!;
      const result = await this.commentService.updateLikeStatus(userId, commentId, req.body.likeStatus);

      if (result.status !== ResultStatus.Success) {
        res.status(result.status).send({ errorsMessages: result.extensions });
        return;
      }

      res.status(204).send();
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  };

}