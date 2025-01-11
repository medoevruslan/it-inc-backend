import { Router } from 'express';
import { getPostsController } from './getPostsController';
import { createPostController } from './createPostController';
import { updatePostController } from './updatePostController';
import { deletePostController } from './deletePostController';

export const postsRouter = Router();

postsRouter.get('/', getPostsController);
postsRouter.post('/', createPostController);
postsRouter.put('/:postId', updatePostController);
postsRouter.get('/:postId', deletePostController);
