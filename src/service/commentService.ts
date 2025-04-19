import { ObjectId } from 'mongodb';
import { HttpStatuses } from '../shared/enums';
import { commentRepository } from '../repository/commentRepository';
import { CommentUpdateType } from '../input-output-types/comment-types';

export const commentService = {
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
