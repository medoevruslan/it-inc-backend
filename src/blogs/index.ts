import { Router } from 'express';
import { getBlogsController } from './getBlogsController';
import { createBlogController } from './createBlogController';
import { updateBlogController } from './updateBlogController';
import { deleteBlogController } from './deleteBlogController';
import { blogBodyValidator } from '../validation/blogBodyValidator';
import { validationErrorMiddleware } from '../middlewares/validationErrorMiddleware';
import { authMiddleware } from '../middlewares';

export const blogsRouter = Router();

blogsRouter.get('/', getBlogsController);
blogsRouter.post('/', blogBodyValidator, authMiddleware, validationErrorMiddleware, createBlogController);
blogsRouter.put('/:blogId', blogBodyValidator, authMiddleware, validationErrorMiddleware, updateBlogController);
blogsRouter.delete('/:blogId', authMiddleware, deleteBlogController);
