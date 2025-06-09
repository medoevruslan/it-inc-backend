import { Router } from 'express';
import { getBlogsController } from './getBlogsController';
import { createBlogController } from './createBlogController';
import { updateBlogController } from './updateBlogController';
import { deleteBlogController } from './deleteBlogController';
import { blogBodyValidator } from '../validation';
import { validationErrorMiddleware } from '../middlewares';
import { getBlogByIdController } from './getBlogByIdController';
import { blogQueryValidator } from '../validation';
import { getPostsByBlogByIdController } from './getPostsByBlogByIdController';
import { createPostByBlogByIdController } from './createPostByBlogByIdController';
import { postByBlogIdBodyValidator } from '../validation/postByBlogIdBodyValidator';
import { baseAuthGuard } from '../middlewares/guard';

export const blogsRouter = Router();

blogsRouter.get('/', blogQueryValidator, getBlogsController);
blogsRouter.get('/:id', getBlogByIdController);
blogsRouter.get('/:blogId/posts', blogQueryValidator, getPostsByBlogByIdController);
blogsRouter.post(
  '/:blogId/posts',
  postByBlogIdBodyValidator,
  baseAuthGuard,
  validationErrorMiddleware,
  createPostByBlogByIdController,
);
blogsRouter.post('/', blogBodyValidator, baseAuthGuard, validationErrorMiddleware, createBlogController);
blogsRouter.put('/:id', blogBodyValidator, baseAuthGuard, validationErrorMiddleware, updateBlogController);
blogsRouter.delete('/:id', baseAuthGuard, deleteBlogController);
