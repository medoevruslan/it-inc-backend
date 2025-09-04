import { injectable } from 'inversify';
import { LikeInfoModel } from '../model/LikesInfoModel';
import { LikeType } from '../shared/enums';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import { LikesInfoDbType } from '../db/likes-info-db-type';

@injectable()
export class LikeInfoService {

  public async findAll() {
    return LikeInfoModel.find().lean();
  }

  public async findByFilter(filter: FilterQuery<LikesInfoDbType>) {
    return LikeInfoModel.find(filter).lean();
  }

  public async getLikesInfoAll(userId: string, targetIds: ObjectId[]) {
    const [likesAggregation, userLikes, newestLikesAgg] = await Promise.all([
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
      LikeInfoModel.aggregate([
        { $match: { parentId: { $in: targetIds }, myStatus: LikeType.Like } },
        { $sort: { updatedAt: -1 } },
        {
          $group: {
            _id: '$parentId',
            newestLikes: {
              $push: {
                addedAt: '$updatedAt',
                login: '$login',
                userId: '$authorId',
              },
            },
          },
        },
        { $project: { newestLikes: { $slice: ['$newestLikes', 3] } } },
      ]),
    ]);

    const likesInfoMap = new Map<string, {
      likesCount: number,
      dislikesCount: number,
    }>(likesAggregation.map(data => [data._id.toString(), {
      likesCount: data.likesCount,
      dislikesCount: data.dislikesCount,
    }]));


    const userLikeMap = new Map(userLikes.map((like) => [like.parentId.toString(), like.myStatus]));
    const newestLikesMap = new Map(newestLikesAgg.map(data => [
      data._id.toString(),
      data.newestLikes
    ]));

    return { likesInfoMap, userLikeMap, newestLikesMap };
  }

  public async getLikesInfoSingle(userId: string, targetId: ObjectId) {
    const [likesInfo, currentUserLikeStatus, newestLikesRaw] = await Promise.all([
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
      LikeInfoModel.find({
        parentId: targetId,
        myStatus: LikeType.Like,
      }).sort({ updatedAt: 'desc' }).limit(3).lean(),
    ]);

    const likesInfoMap = new Map(likesInfo.map(data => [data._id.toString(), {
      likesCount: data.likesCount,
      dislikesCount: data.dislikesCount,
      myStatus: currentUserLikeStatus?.myStatus ?? LikeType.None,
    }]));

    const targetLikeInfo = likesInfoMap.get(targetId.toString()) ?? {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeType.None,
    };

    const newestLikes = newestLikesRaw.map(info => ({
      addedAt: info.updatedAt ?? info.createdAt,
      login: info.login,
      userId: info.authorId,
    }));

    return { likesInfoMap, targetLikeInfo, newestLikes };
  }
}