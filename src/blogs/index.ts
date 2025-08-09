import { Router } from 'express';
import { blogBodyValidator, blogQueryValidator } from '../validation';
import { validationErrorMiddleware } from '../middlewares';
import { postByBlogIdBodyValidator } from '../validation/postByBlogIdBodyValidator';
import { baseAuthGuard } from '../middlewares/guard';
import { blogController } from '../composition-root';

export const blogsRouter = Router();

blogsRouter.get('/', blogQueryValidator, blogController.getBlogs.bind(blogController));
blogsRouter.get('/:id', blogController.getBlogById.bind(blogController));
blogsRouter.get('/:blogId/posts', blogQueryValidator, blogController.getPostsByBlogById.bind(blogController));
blogsRouter.post(
  '/:blogId/posts',
  postByBlogIdBodyValidator,
  baseAuthGuard,
  validationErrorMiddleware,
  blogController.createPostByBlogById.bind(blogController),
);
blogsRouter.post('/', blogBodyValidator, baseAuthGuard, validationErrorMiddleware, blogController.createBlog.bind(blogController));
blogsRouter.put('/:id', blogBodyValidator, baseAuthGuard, validationErrorMiddleware, blogController.updateBlog.bind(blogController));
blogsRouter.delete('/:id', baseAuthGuard, blogController.deleteBlog.bind(blogController));
