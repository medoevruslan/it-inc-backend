import { WithId } from 'mongodb';
import { CommentOutputType } from '../input-output-types/comment-types';
import { CommentDbType } from '../db/comment-db-type';

export const commentMapper = {
  mapCommentToOutputType(comment: CommentDbType): CommentOutputType {
    return {
      id: comment._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      likesInfo: comment.likesInfo
    };
  },
};
