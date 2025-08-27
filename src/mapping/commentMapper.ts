import { CommentDbType } from '../db/comment-db-type';
import { CommentOutputType, LikesInfo } from '../input-output-types/comment-types';

export const commentMapper = {
  mapCommentToOutputType(comment: CommentDbType, likesInfo:LikesInfo): CommentOutputType {
    return {
      id: comment._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      likesInfo
    };
  },
};
