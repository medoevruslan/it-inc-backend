import { Router } from 'express';
import { accessTokenGuard } from '../middlewares/guard';
import { validationErrorMiddleware } from '../middlewares';
import { commentBodyValidator } from '../validation/commentBodyValidator';
import { commentsController } from '../composition-root';

export const commentsRouter = Router();

commentsRouter.get('/:id', commentsController.getComments.bind(commentsController));
commentsRouter.put(
  '/:id',
  commentBodyValidator,
  accessTokenGuard,
  validationErrorMiddleware,
  commentsController.updateComments.bind(commentsController),
);
commentsRouter.delete('/:id', accessTokenGuard, commentsController.deleteComments.bind(commentsController));
