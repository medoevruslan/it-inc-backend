import { ObjectId } from 'mongodb';
import { HttpStatuses } from '../shared/enums';
import { commentRepository } from '../repository/commentRepository';
import { CommentInputType, CommentType, CommentUpdateType } from '../input-output-types/comment-types';
import { CommentDbType } from '../db/comment-db-type';
import { postService } from './postService';
import { userQueryRepository } from '../repository/userQueryRepository';
import { GetAllQueryParamNoSearchTerm } from '../shared/types';

export const commentService = {
  async create({ userId, postId, content }: CommentInputType) {
    if (!ObjectId.isValid(postId)) {
      console.log('post id is not valid on create comment');
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const foundPost = await postService.findById(postId);

    if (!foundPost) {
      console.log(`post ${postId} not found on create comment`);
      throw new Error(HttpStatuses.NotFound.toString());
    }

    const foundUser = await userQueryRepository.findById(userId);

    const newComment: CommentDbType = {
      content,
      postId,
      createdAt: new Date(),
      commentatorInfo: {
        userId: foundUser?.id!,
        userLogin: foundUser?.login!,
      },
    };

    return await commentRepository.create(newComment);
  },
  async update(userId: string, { commentId, update }: CommentUpdateType) {
    if (!ObjectId.isValid(commentId) || !ObjectId.isValid(userId)) {
      throw new Error(HttpStatuses.NotFound.toString());
    }

    const foundComment = await commentRepository.findById(commentId);

    if (!foundComment) {
      console.log(`comment ${commentId} not found on update`);
      throw new Error(HttpStatuses.NotFound.toString());
    }

    if (userId !== foundComment?.commentatorInfo.userId) {
      console.log(`user ${userId} have no permission to update comment`);
      throw new Error(HttpStatuses.Forbidden.toString());
    }

    return commentRepository.update({ commentId, update });
  },
  async delete(userId: string, commentId: string) {
    if (!ObjectId.isValid(commentId) || !ObjectId.isValid(userId)) {
      throw new Error(HttpStatuses.NotFound.toString());
    }

    const foundComment = await commentRepository.findById(commentId);

    if (!foundComment) {
      console.log(`comment ${commentId} not found on delete`);
      throw new Error(HttpStatuses.NotFound.toString());
    }

    if (userId !== foundComment?.commentatorInfo.userId) {
      console.log(`user ${userId} have no permission to delete comment`);
      throw new Error(HttpStatuses.Forbidden.toString());
    }

    return commentRepository.delete(commentId);
  },

  async findByPostId(postId: string, query: GetAllQueryParamNoSearchTerm<CommentType>) {
    if (!ObjectId.isValid(postId)) {
      console.log('post id is not valid on find by post id');
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const foundPost = await postService.findById(postId);

    return await commentRepository.findByPostId(foundPost.id, query);
  },

};
