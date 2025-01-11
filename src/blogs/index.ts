import { Router } from 'express';
import { getBlogsController } from './getBlogsController';
import { createBlogController } from './createBlogController';
import { updateBlogController } from './updateBlogController';
import { deleteBlogController } from './deleteBlogController';

export const blogsRouter = Router();

blogsRouter.get('/', getBlogsController);
blogsRouter.post('/', createBlogController);
blogsRouter.put('/:blogId', updateBlogController);
blogsRouter.delete('/:blogId', deleteBlogController);
