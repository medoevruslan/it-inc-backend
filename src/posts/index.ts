import { Router } from 'express';
import { getPostsController } from './getPostsController';
import { createPostController } from './createPostController';
import { updatePostController } from './updatePostController';
import { deletePostController } from './deletePostController';
import { postBodyValidator } from '../validation/postBodyValidator';
import { validationErrorMiddleware } from '../middlewares/validationErrorMiddleware';
import { authMiddleware } from '../middlewares';

export const postsRouter = Router();

postsRouter.get('/', getPostsController);
postsRouter.post('/', postBodyValidator, authMiddleware, validationErrorMiddleware, createPostController);
postsRouter.put('/:postId', postBodyValidator, authMiddleware, validationErrorMiddleware, updatePostController);
postsRouter.delete('/:postId', authMiddleware, deletePostController);
