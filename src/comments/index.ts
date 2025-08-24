import { Router } from 'express';
import { accessTokenGuard } from '../middlewares/guard';
import { validationErrorMiddleware } from '../middlewares';
import { commentBodyValidator } from '../validation/commentBodyValidator';
import { container } from '../composition-root';
import { CommentsController } from './CommentsController';

const commentsController = container.get(CommentsController)

export const commentsRouter = Router();

commentsRouter.get('/:id', commentsController.getComments.bind(commentsController));
commentsRouter.put(
  '/:id',
  commentBodyValidator,
  accessTokenGuard,
  validationErrorMiddleware,
  commentsController.updateComments.bind(commentsController),
);
commentsRouter.put(
  '/:commentId',
  accessTokenGuard,
  commentsController.likeComments.bind(commentsController),
);
commentsRouter.delete('/:id', accessTokenGuard, commentsController.deleteComments.bind(commentsController));
