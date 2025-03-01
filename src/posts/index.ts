import { Router } from 'express';
import { getPostsController } from './getPostsController';
import { createPostController } from './createPostController';
import { updatePostController } from './updatePostController';
import { deletePostController } from './deletePostController';
import { postBodyValidator } from '../validation';
import { validationErrorMiddleware } from '../middlewares';
import { authMiddleware } from '../middlewares';
import { getPostByIdController } from './getPostByIdController';
import { postQueryValidator } from '../validation/postQueryValidator';

export const postsRouter = Router();

postsRouter.get('/', postQueryValidator, getPostsController);
postsRouter.get('/:id', getPostByIdController);
postsRouter.post('/', postBodyValidator, authMiddleware, validationErrorMiddleware, createPostController);
postsRouter.put('/:id', postBodyValidator, authMiddleware, validationErrorMiddleware, updatePostController);
postsRouter.delete('/:id', authMiddleware, deletePostController);
