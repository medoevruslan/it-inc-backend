import { ObjectId } from 'mongodb';
import { HttpStatuses } from '../shared/enums';
import { commentRepository } from '../repository/commentRepository';
import { CommentInputType, CommentUpdateType } from '../input-output-types/comment-types';
import { CommentDbType } from '../db/comment-db-type';
import { postService } from './postService';
import { userQueryRepository } from '../repository/userQueryRepository';

export const commentService = {
  async create({ userId, postId, content }: CommentInputType) {
    if (!ObjectId.isValid(postId)) {
      console.log('post id is not valid on create comment');
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const foundPost = await postService.findById(postId);

    if (!foundPost) {
      console.log('post not found on create comment');
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

    return  await commentRepository.create(newComment);
  },
  async update({ commentId, update }: CommentUpdateType) {
    if (!ObjectId.isValid(commentId)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    return commentRepository.update({ commentId, update });
  },
  async delete(commentId: string) {
    if (!ObjectId.isValid(commentId)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    return commentRepository.delete(commentId);
  },

};
