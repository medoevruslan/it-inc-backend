import { Router } from 'express';
import { getBlogsController } from './getBlogsController';
import { createBlogController } from './createBlogController';
import { updateBlogController } from './updateBlogController';
import { deleteBlogController } from './deleteBlogController';
import { blogBodyValidator } from '../validation';
import { validationErrorMiddleware } from '../middlewares';
import { authMiddleware } from '../middlewares';
import { getBlogByIdController } from './getBlogByIdController';
import { blogQueryValidator } from '../validation';

export const blogsRouter = Router();

blogsRouter.get('/', blogQueryValidator, getBlogsController);
blogsRouter.get('/:id', getBlogByIdController);
blogsRouter.post('/', blogBodyValidator, authMiddleware, validationErrorMiddleware, createBlogController);
blogsRouter.put('/:id', blogBodyValidator, authMiddleware, validationErrorMiddleware, updateBlogController);
blogsRouter.delete('/:id', authMiddleware, deleteBlogController);
