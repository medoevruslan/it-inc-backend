import { ObjectId } from 'mongodb';
import { HttpStatuses } from '../shared/enums';
import { commentRepository } from '../repository/commentRepository';

export const commentService = {
  async update(commentId: string) {},
  async delete(commentId: string) {
    if (!ObjectId.isValid(commentId)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    return commentRepository.delete(commentId);
  },
};
