import { Router } from 'express';
import { getBlogsController } from './getBlogsController';
import { createBlogController } from './createBlogController';
import { updateBlogController } from './updateBlogController';
import { deleteBlogController } from './deleteBlogController';
import { blogBodyValidator } from '../validation/blogBodyValidator';
import { validationErrorMiddleware } from '../middlewares/validationErrorMiddleware';

export const blogsRouter = Router();

blogsRouter.get('/', getBlogsController);
blogsRouter.post('/', blogBodyValidator, validationErrorMiddleware, createBlogController);
blogsRouter.put('/:blogId', blogBodyValidator, validationErrorMiddleware, updateBlogController);
blogsRouter.delete('/:blogId', deleteBlogController);
