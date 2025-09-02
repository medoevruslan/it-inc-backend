import { LikeType } from '../shared/enums';

export type LikesInfoDbType = {
  login: string
  parentId: string;
  authorId: string;
  myStatus: LikeType;
  createdAt: string,
  updatedAt: string
}

export type LikesInfoInputDbType = {
  login: string
  parentId: string;
  authorId: string;
  myStatus: LikeType;
}