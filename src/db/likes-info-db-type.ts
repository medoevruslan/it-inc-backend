import { LikeType } from '../shared/enums';

export type LikesInfoDbType = {
  parentId: string;
  authorId: string;
  myStatus: LikeType;
}