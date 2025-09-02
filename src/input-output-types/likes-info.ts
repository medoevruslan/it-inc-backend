import { LikeType } from '../shared/enums';

export type LikesInfo = {
  likesCount: number,
  dislikesCount: number,
  myStatus: LikeType
}

export type ExtendedLikesInfo = LikesInfo & {
  newestLikes: LikeMeta[]
}

export type LikeMeta =  {
  addedAt: string,
  userId: string,
  login: string
}