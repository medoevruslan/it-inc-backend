import { ObjectId } from 'mongodb';
import { HttpStatuses, LikeType } from '../shared/enums';
import { commentMapper } from '../mapping/commentMapper';
import { injectable } from 'inversify';
import { CommentModel } from '../model';
import { LikeInfoModel } from '../model/LikesInfoModel';

@injectable()
export class CommentQueryRepository {
  async findAll(userId: string) {
    const comments = await CommentModel.find().lean();

    const commentIds = comments.map(c => c._id);

    if (commentIds.length === 0) {
      return [];
    }

    const [likesAggregation, userLikes] = await Promise.all([
      LikeInfoModel.aggregate([
        { $match: { parentId: { $in: commentIds } } },
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
        parentId: { $in: commentIds },
        authorId: userId,
      }).lean(),
    ]);

    const likesInfoMap = new Map(likesAggregation.map(data => [data._id.toString(), {
      likesCount: data.likesCount,
      dislikesCount: data.dislikesCount,
    }]));

    const userLikeMap = new Map(userLikes.map((like) => [like.parentId.toString(), like.myStatus]));

    return comments.map(c => {
      const likesInfo = likesInfoMap.get(c._id.toString()) ?? { likesCount: 0, dislikesCount: 0 };
      const userLikeStatus = userLikeMap.get(c._id.toString()) ?? LikeType.None;
      return commentMapper.mapCommentToOutputType(c, { ...likesInfo, myStatus: userLikeStatus });
    });
  }

  async findById(commentId: string, userId: string) {
    if (!ObjectId.isValid(commentId)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    // const foundComment = await db.getCollections().commentsCollection.findOne({ _id: new ObjectId(commentId) });
    const foundComment = await CommentModel.findById(commentId).lean();

    if (!foundComment) {
      throw new Error(HttpStatuses.NotFound.toString());
    }

    const [likesInfo, currentUserLikeStatus] = await Promise.all([
      LikeInfoModel.aggregate([
        { $match: { parentId: commentId } },
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
      LikeInfoModel.findOne({ parentId: commentId, authorId: userId }).lean(),
    ]);

    const likesMap = new Map(likesInfo.map(data => [data._id.toString(), {
      likesCount: data.likesCount,
      dislikesCount: data.dislikesCount,
      myStatus: currentUserLikeStatus?.myStatus ?? LikeType.None,
    }]));

    const commentLikeInfo = likesMap.get(foundComment._id.toString()) ?? {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeType.None,
    };

    return commentMapper.mapCommentToOutputType(foundComment, commentLikeInfo);
  }

}
