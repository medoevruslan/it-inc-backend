import { Request, Response } from 'express';
import { HttpStatuses, LikeType } from '../shared/enums';
import { handleApiError } from '../shared/utils';
import { InputPostType, OutputPostType, PostType } from '../input-output-types/post-types';
import { GetAllQueryParams } from '../shared/types';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';
import { CommentService } from '../service/CommentService';
import { PostService } from '../service/PostService';
import { inject, injectable } from 'inversify';
import { CommentType } from '../input-output-types/comment-types';
import { CommentRepository } from '../repository/CommentRepository';
import { commentMapper } from '../mapping/commentMapper';
import { LikesInfoQueryRepository } from '../repository/LikesInfoQueryRepository';
import { jwtService } from '../composition-root';

@injectable()
export class PostsController {
  constructor(
    @inject(PostService) protected postService: PostService,
    @inject(CommentService) protected commentService: CommentService,
    @inject(CommentRepository) protected commentRepository: CommentRepository,
    @inject(LikesInfoQueryRepository) protected likesInfoQueryRepository: LikesInfoQueryRepository) {
  }

  async createPostComments(
    req: Request<{ postId: string }, {}, { content: string }>,
    res: Response,
  ) {
    try {
      const createdId = await this.commentService.create({
        userId: req.userId!,
        postId: req.params.postId,
        content: req.body.content,
      });

      const foundComment = await this.commentRepository.findById(createdId);

      if (!foundComment) {
        console.log('Could not found just created comment: ', createdId);
        res.status(HttpStatuses.ServerError).send();
        return;
      }

      console.log(`create new comment: ${createdId} for post: ${req.params.postId}`);

      const commentWithLikesInfo = commentMapper.mapCommentToOutputType(foundComment, {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeType.None,
      });


      res.status(HttpStatuses.Created).send(commentWithLikesInfo);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async createPost(req: Request<{}, {}, InputPostType>, res: Response) {
    try {
      const createdPost = await this.postService.create(req.body);
      res.status(201).send(createdPost);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async deletePost(req: Request<{ id: string }>, res: Response) {
    try {
      await this.postService.deleteById(req.params.id);
      res.status(204).send();
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async getPostById(req: Request<{ id: string }>, res: Response) {
    try {
      const found = await this.postService.findById(req.params.id);
      res.send(found);
    } catch (err: unknown) {
      const error = err as Error;
      const errorCode = Number(error.message);
      if (isFinite(errorCode)) {
        res.status(errorCode).send();
      } else {
        res.status(HttpStatuses.ServerError).send(error.message);
      }
    }
  }

  async getPostComments(req: Request<{
    postId: string
  }, {}, {}, GetAllQueryParams<CommentType>>, res: Response) {
    try {
      console.log(`get by post id: ${req.params.postId} comments`);

      let userId = '';

      // TODO: use middleware
      if (req.headers.authorization) {
        const [authType, token] = req.headers.authorization.split(' ');
        if (authType === 'Bearer'){
          const payload = await jwtService.verifyToken<{ userId: string }>(token);
          if (payload) {
            userId = payload.userId
          }
        }
      }

      const comments = await this.commentService.findByPostId(req.params.postId, req.query, userId);

      console.log(`found comments: ${JSON.stringify(comments)}`);

      res.status(HttpStatuses.Success).send(comments);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async getPosts(
    req: Request<{}, {}, {}, GetAllQueryParams<PostType>>,
    res: Response<OutputModelTypeWithInfo<OutputPostType>>,
  ) {
    try {
      const posts = await this.postService.findAll(req.query);
      res.status(HttpStatuses.Success).send(posts);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async updatePost(req: Request<{ id: string }, {}, PostType>, res: Response) {
    try {
      await this.postService.update({ postId: req.params.id, update: req.body });
      res.status(204).send();
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }
}