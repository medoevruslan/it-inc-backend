import { ObjectId } from 'mongodb';
import { HttpStatuses, LikeType, ResultStatus } from '../shared/enums';
import { CommentRepository } from '../repository/CommentRepository';
import { CommentInputType, CommentType, CommentUpdateType } from '../input-output-types/comment-types';
import { GetAllQueryParamNoSearchTerm, Result } from '../shared/types';
import { UserQueryRepository } from '../repository/UserQueryRepository';
import { PostService } from './PostService';
import { inject, injectable } from 'inversify';
import { UserRepository } from '../repository/UserRepository';
import { LikesInfoRepository } from '../repository/LikesInfoRepository';

@injectable()
export class CommentService {
  constructor(
    @inject(PostService) protected postService: PostService,
    @inject(CommentRepository) protected commentRepository: CommentRepository,
    @inject(UserQueryRepository) protected usersRepository: UserRepository,
    @inject(LikesInfoRepository) protected likesInfoRepository: LikesInfoRepository,
  ) {
  }

  async create({ userId, postId, content }: CommentInputType) {
    if (!ObjectId.isValid(postId)) {
      console.log('post id is not valid on create comment');
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const foundPost = await this.postService.findById(postId);

    if (!foundPost) {
      console.log(`post ${postId} not found on create comment`);
      throw new Error(HttpStatuses.NotFound.toString());
    }

    const foundUser = await this.usersRepository.findById(userId);

    const newComment: CommentType = {
      content,
      postId,
      commentatorInfo: {
        userId: foundUser?.id!,
        userLogin: foundUser?.login!,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeType.None,
      },
    };

    return await this.commentRepository.create(newComment);
  }

  async update(userId: string, { commentId, update }: CommentUpdateType) {
    if (!ObjectId.isValid(commentId) || !ObjectId.isValid(userId)) {
      throw new Error(HttpStatuses.NotFound.toString());
    }

    const foundComment = await this.commentRepository.findById(commentId);

    if (!foundComment) {
      console.log(`comment ${commentId} not found on update`);
      throw new Error(HttpStatuses.NotFound.toString());
    }

    if (userId !== foundComment?.commentatorInfo.userId) {
      console.log(`user ${userId} have no permission to update comment`);
      throw new Error(HttpStatuses.Forbidden.toString());
    }

    return this.commentRepository.update({ commentId, update });
  }

  async delete(userId: string, commentId: string) {
    if (!ObjectId.isValid(commentId) || !ObjectId.isValid(userId)) {
      throw new Error(HttpStatuses.NotFound.toString());
    }

    const foundComment = await this.commentRepository.findById(commentId);

    if (!foundComment) {
      console.log(`comment ${commentId} not found on delete`);
      throw new Error(HttpStatuses.NotFound.toString());
    }

    if (userId !== foundComment?.commentatorInfo.userId) {
      console.log(`user ${userId} have no permission to delete comment`);
      throw new Error(HttpStatuses.Forbidden.toString());
    }

    return this.commentRepository.delete(commentId);
  }

  async findByPostId(postId: string, query: GetAllQueryParamNoSearchTerm<CommentType>) {
    if (!ObjectId.isValid(postId)) {
      console.log('post id is not valid on find by post id');
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const foundPost = await this.postService.findById(postId);

    return await this.commentRepository.findByPostId(foundPost.id, query);
  }

  public async updateLikeStatus(userId: string, commentId: string, likeStatus: LikeType): Promise<Result> {
    if (!ObjectId.isValid(commentId)) {
      console.log('comment id is not valid on updateLikeStatus');
      return {
        status: ResultStatus.BadRequest,
        extensions: [],
        data: null,
      };
    }

    const foundComment = await this.commentRepository.findById(commentId);
    if (!foundComment) {
      return {
        status: ResultStatus.NotFound,
        extensions: [],
        data: null,
      };
    }

    await this.likesInfoRepository.add({ parentId: commentId, authorId: userId, myStatus: likeStatus });

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null,
    };
  }
}
