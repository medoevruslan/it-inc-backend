import { Router } from 'express';
import { getPostsController } from './getPostsController';
import { createPostController } from './createPostController';
import { updatePostController } from './updatePostController';
import { deletePostController } from './deletePostController';
import { postBodyValidator } from '../validation';
import { validationErrorMiddleware } from '../middlewares';
import { getPostByIdController } from './getPostByIdController';
import { postQueryValidator } from '../validation/postQueryValidator';
import { baseAuthGuard } from '../middlewares/guard';

export const postsRouter = Router();

postsRouter.get('/', postQueryValidator, getPostsController);
postsRouter.get('/:id', getPostByIdController);
postsRouter.post('/', postBodyValidator, baseAuthGuard, validationErrorMiddleware, createPostController);
postsRouter.put('/:id', postBodyValidator, baseAuthGuard, validationErrorMiddleware, updatePostController);
postsRouter.delete('/:id', baseAuthGuard, deletePostController);
