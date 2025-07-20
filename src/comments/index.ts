import { Router } from 'express';
import { getCommentsController } from './getCommentsController';
import { updateCommentsController } from './updateCommentsController';
import { deleteCommentsController } from './deleteCommentsController';
import { accessTokenGuard } from '../middlewares/guard';
import { validationErrorMiddleware } from '../middlewares';
import { commentBodyValidator } from '../validation/commentBodyValidator';

export const commentsRouter = Router();

commentsRouter.get('/:id', getCommentsController);
commentsRouter.put(
  '/:id',
  commentBodyValidator,
  accessTokenGuard,
  validationErrorMiddleware,
  updateCommentsController,
);
commentsRouter.delete('/:id', accessTokenGuard, deleteCommentsController);
