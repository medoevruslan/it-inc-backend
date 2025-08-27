import { CommentDbType } from '../db/comment-db-type';
import { LikeType } from '../shared/enums';
import { ObjectId } from 'mongodb';

export type CommentType = Omit<CommentDbType, '_id' | 'createdAt'>;
export type CommentUpdateType = { commentId: string; update: Partial<CommentDbType> };
export type CommentInputType = { userId: string; postId: string; content: string };
export type CommentOutputType = Omit<CommentType, 'postId'> & { id: string, createdAt: string, likesInfo: LikesInfo }

export type LikesInfo = {
  likesCount: number,
  dislikesCount: number,
  myStatus: LikeType
}

export type LikesAggregationResult = {
  _id: ObjectId;
  likesCount: number;
  dislikesCount: number;
};