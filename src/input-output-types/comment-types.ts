import { CommentDbType } from '../db/comment-db-type';
import { LikeType } from '../shared/enums';

export type CommentType = CommentDbType & { id: string };
export type CommentUpdateType = { commentId: string; update: { content: string } };
export type CommentInputType = { userId: string; postId: string; content: string };
export type OutputCommentType = Omit<CommentType, 'postId'> & {
  likesInfo: {
    likesCount: number,
    dislikesCount: number,
    myStatus: keyof typeof LikeType
  }
};
