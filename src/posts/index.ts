import { Router } from 'express';
import { getPostsController } from './getPostsController';
import { createPostController } from './createPostController';
import { updatePostController } from './updatePostController';
import { deletePostController } from './deletePostController';
import { postBodyValidator } from '../validation/postBodyValidator';
import { validationErrorMiddleware } from '../middlewares/validationErrorMiddleware';

export const postsRouter = Router();

postsRouter.get('/', getPostsController);
postsRouter.post('/', postBodyValidator, validationErrorMiddleware, createPostController);
postsRouter.put('/:postId', postBodyValidator, validationErrorMiddleware, updatePostController);
postsRouter.delete('/:postId', deletePostController);
