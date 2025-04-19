import { WithId } from 'mongodb';
import { OutputCommentType } from '../input-output-types/comment-types';
import { CommentDbType } from '../db/comment-db-type';

export const commentMapper = {
  mapCommentToOutputType(comment: WithId<CommentDbType>): OutputCommentType {
    return {
      id: comment._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
    };
  },
};
