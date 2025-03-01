import { Router } from 'express';
import { getBlogsController } from './getBlogsController';
import { createBlogController } from './createBlogController';
import { updateBlogController } from './updateBlogController';
import { deleteBlogController } from './deleteBlogController';
import { blogBodyValidator, postBodyValidator } from '../validation';
import { validationErrorMiddleware } from '../middlewares';
import { authMiddleware } from '../middlewares';
import { getBlogByIdController } from './getBlogByIdController';
import { blogQueryValidator } from '../validation';
import { getPostsByBlogByIdController } from './getPostsByBlogByIdController';
import { createPostByBlogByIdController } from './createPostByBlogByIdController';
import { postByBlogIdBodyValidator } from '../validation/postByBlogIdBodyValidator';

export const blogsRouter = Router();

blogsRouter.get('/', blogQueryValidator, getBlogsController);
blogsRouter.get('/:id', getBlogByIdController);
blogsRouter.get('/:blogId/posts', blogQueryValidator, getPostsByBlogByIdController);
blogsRouter.post(
  '/:blogId/posts',
  postByBlogIdBodyValidator,
  authMiddleware,
  validationErrorMiddleware,
  createPostByBlogByIdController,
);
blogsRouter.post('/', blogBodyValidator, authMiddleware, validationErrorMiddleware, createBlogController);
blogsRouter.put('/:id', blogBodyValidator, authMiddleware, validationErrorMiddleware, updateBlogController);
blogsRouter.delete('/:id', authMiddleware, deleteBlogController);
