import { Router } from 'express';
import { getCommentsController } from './getCommentsController';
import { putCommentsController } from './putCommentsController';
import { deleteCommentsController } from './deleteCommentsController';
import { accessTokenGuard } from '../middlewares/guard';
import { validationErrorMiddleware } from '../middlewares';
import { commentBodyValidator } from '../validation/commentBodyValidator';

export const commentsRouter = Router();

commentsRouter.get('/:id', accessTokenGuard, getCommentsController);
commentsRouter.put(
  '/:commentId',
  commentBodyValidator,
  accessTokenGuard,
  validationErrorMiddleware,
  putCommentsController,
);
commentsRouter.delete('/:commentId', accessTokenGuard, deleteCommentsController);
