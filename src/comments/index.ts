import { Router } from 'express';
import { getCommentsController } from './getCommentsController';
import { putCommentsController } from './putCommentsController';
import { deleteCommentsController } from './deleteCommentsController';
import { accessTokenGuard } from '../middlewares/guard';

export const commentsRouter = Router();

commentsRouter.get('/:id', accessTokenGuard, getCommentsController);
commentsRouter.put('/:commentId', accessTokenGuard, putCommentsController);
commentsRouter.delete('/:commentId', accessTokenGuard, deleteCommentsController);
