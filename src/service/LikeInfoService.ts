import { injectable } from 'inversify';
import { LikeInfoModel } from '../model/LikesInfoModel';
import { LikeType } from '../shared/enums';
import { ObjectId } from 'mongodb';

@injectable()
export class LikeInfoService {
  public async getLikesInfoAll(userId: string, targetIds: ObjectId[]) {
    const [likesAggregation, userLikes] = await Promise.all([
      LikeInfoModel.aggregate([
        { $match: { parentId: { $in: targetIds } } },
        {
          $group: {
            _id: '$parentId',
            likesCount: {
              $sum: { $cond: [{ $eq: ['$myStatus', LikeType.Like] }, 1, 0] },
            },
            dislikesCount: {
              $sum: { $cond: [{ $eq: ['$myStatus', LikeType.Dislike] }, 1, 0] },
            },
          },
        },
      ]),
      LikeInfoModel.find({
        parentId: { $in: targetIds },
        authorId: userId,
      }).lean(),
    ]);

    const likesInfoMap = new Map<string, {
      likesCount: number,
      dislikesCount: number,
      addedAt: string,
      login: string
    }>(likesAggregation.map(data => [data._id.toString(), {
      likesCount: data.likesCount,
      dislikesCount: data.dislikesCount,
      addedAt: data.createdAt,
      login: data.login,
    }]));


    const userLikeMap = new Map(userLikes.map((like) => [like.parentId.toString(), like.myStatus]));

    return { likesInfoMap, userLikeMap };
  }

  public async getLikesInfoSingle(userId: string, targetId: ObjectId) {
    const [likesInfo, currentUserLikeStatus] = await Promise.all([
      LikeInfoModel.aggregate([
        { $match: { parentId: targetId } },
        {
          $group: {
            _id: '$parentId',
            likesCount: {
              $sum: { $cond: [{ $eq: ['$myStatus', LikeType.Like] }, 1, 0] },
            },
            dislikesCount: {
              $sum: { $cond: [{ $eq: ['$myStatus', LikeType.Dislike] }, 1, 0] },
            },
          },
        },
      ]),
      LikeInfoModel.findOne({ parentId: targetId, authorId: userId }).lean(),
    ]);

    const likesInfoMap = new Map(likesInfo.map(data => [data._id.toString(), {
      likesCount: data.likesCount,
      dislikesCount: data.dislikesCount,
      myStatus: currentUserLikeStatus?.myStatus ?? LikeType.None,
      addedAt: currentUserLikeStatus?.createdAt ?? 'unknown',
      login: currentUserLikeStatus?.login ?? 'unknown',
    }]));

    const targetLikeInfo = likesInfoMap.get(targetId.toString()) ?? {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeType.None,
    };

    const newestLikes = [...likesInfoMap.values()].map(info => ({ addedAt: info.addedAt, login: info.login, userId }))

    return { likesInfoMap, targetLikeInfo, newestLikes };
  }
}