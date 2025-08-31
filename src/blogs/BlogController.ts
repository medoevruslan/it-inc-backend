import { Request, Response } from 'express';
import { BlogType, InputBlogType, UpdateBlogType } from '../input-output-types/blog-types';
import { InputPostType, PostType } from '../input-output-types/post-types';
import { GetAllQueryParams } from '../shared/types';
import { BlogService } from '../service/BlogService';
import { PostService } from '../service/PostService';
import { handleApiError } from '../shared/utils';
import { inject } from 'inversify';
import { JwtService } from '../service/JwtService';

export class BlogController {

  constructor(@inject(BlogService) protected blogService: BlogService, @inject(PostService) protected postService: PostService, @inject(JwtService) protected jwtService: JwtService) {
  }

  async createBlog(req: Request<{}, {}, InputBlogType>, res: Response) {
    try {
      const createdBlog = await this.blogService.create(req.body);
      res.status(201).send(createdBlog);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async createPostByBlogById(
    req: Request<{ blogId: string }, {}, Omit<InputPostType, 'blogId'>>,
    res: Response,
  ) {
    try {
      const userId = req.userId!
      const post = await this.postService.create({ blogId: req.params.blogId, ...req.body }, userId);
      res.status(201).send(post);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async deleteBlog(req: Request<{ id: string }>, res: Response) {
    try {
      await this.blogService.deleteById(req.params.id);
      res.status(204).send();
    } catch (err: unknown) {
      const error = err as Error;
      const errorCode = Number(error.message);
      if (isFinite(errorCode)) {
        res.status(errorCode).send();
      } else {
        res.status(500).send(error.message);
      }
    }
  }

  async getBlogById(req: Request<{ id: string }>, res: Response) {
    try {
      const blog = await this.blogService.findById(req.params.id);
      res.send(blog);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  };

  async getBlogs(req: Request<{}, {}, {}, GetAllQueryParams<BlogType>>, res: Response) {
    try {
      const blogs = await this.blogService.findAll(req.query);
      res.send(blogs);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async getPostsByBlogById(
    req: Request<{ blogId: string }, {}, {}, GetAllQueryParams<PostType>>,
    res: Response,
  ) {
    try {

      let userId = '';

      // TODO: use middleware
      if (req.headers.authorization) {
        const [authType, token] = req.headers.authorization.split(' ');
        if (authType === 'Bearer'){
          const payload = await this.jwtService.verifyToken<{ userId: string }>(token);
          if (payload) {
            userId = payload.userId
          }
        }
      }

      const posts = await this.blogService.findPostsByBlogId(req.params.blogId, req.query, userId);
      res.send(posts);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  };

  async updateBlog(
    req: Request<{ id: string }, {}, UpdateBlogType['update']>,
    res: Response,
  ) {
    try {
      await this.blogService.update({ blogId: req.params.id, update: req.body });
      res.status(204).send();
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  };

}