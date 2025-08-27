import { WithId } from 'mongodb';
import { LikeType } from '../shared/enums';

export type CommentDbType = WithId<{
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  postId: string;
}>;

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};


