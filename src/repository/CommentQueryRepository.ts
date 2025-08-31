import { ObjectId } from 'mongodb';
import { HttpStatuses, LikeType } from '../shared/enums';
import { commentMapper } from '../mapping/commentMapper';
import { inject, injectable } from 'inversify';
import { CommentModel } from '../model';
import { LikeInfoService } from '../service/LikeInfoService';

@injectable()
export class CommentQueryRepository {

  constructor(@inject(LikeInfoService) protected likesInfoService: LikeInfoService) {
  }

  async findAll(userId: string) {
    const comments = await CommentModel.find().lean();

    const commentIds = comments.map(c => c._id);

    if (commentIds.length === 0) {
      return [];
    }

    const { likesInfoMap, userLikeMap } = await this.likesInfoService.getLikesInfoAll(userId, commentIds)

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

    const parentId = new ObjectId(commentId)

    const { commentLikeInfo } = await this.likesInfoService.getLikesInfoSingle(userId, parentId)

    return commentMapper.mapCommentToOutputType(foundComment, commentLikeInfo);
  }

}
