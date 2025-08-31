import { ObjectId } from 'mongodb';
import { CommentType, CommentUpdateType } from '../input-output-types/comment-types';
import { CommentDbType } from '../db/comment-db-type';
import { GetAllQueryParamNoSearchTerm } from '../shared/types';
import { HttpStatuses, LikeType } from '../shared/enums';
import { commentMapper } from '../mapping/commentMapper';
import { inject, injectable } from 'inversify';
import { CommentModel } from '../model';
import { LikeInfoModel } from '../model/LikesInfoModel';
import { LikeInfoService } from '../service/LikeInfoService';

@injectable()
export class CommentRepository {

  constructor(@inject(LikeInfoService) protected likesInfoService: LikeInfoService) {
  }

  async create(comment: CommentType) {
    const commentModel = new CommentModel(comment);
    await commentModel.save();
    return commentModel._id.toString();
  }

  async update({ commentId, update }: CommentUpdateType) {
    const commentModel = await CommentModel.findById(commentId);
    if (!commentModel) return false;
    Object.assign(commentModel, update);
    await commentModel.save();
    return true;
  }

  async delete(commentId: string) {
    const result = await CommentModel.findByIdAndDelete(commentId);
    return result !== null;
  }

  async findAll() {
    return CommentModel.find().lean();
  }

  async findById(commentId: string) {
    return CommentModel.findById(commentId).lean();
  }

  async findByPostId(postId: string, query: GetAllQueryParamNoSearchTerm<CommentType>, userId: string) {
    if (!ObjectId.isValid(postId)) {
      console.log('post id is not valid on find by post id');
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const { sortDirection, sortBy, pageSize, pageNumber } = query;

    const convertedPageSize = Number(pageSize);

    const skip = (Number(pageNumber) - 1) * convertedPageSize;

    const [totalCount, comments]: [number, CommentDbType[]] = await Promise.all([
      CommentModel.countDocuments({ postId }), // Fetch total count
      CommentModel.find()
        .where('postId')
        .equals(postId)
        .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(convertedPageSize)
        .lean(),
    ]);

    const commentIds = comments.map(c => c._id);

    if (commentIds.length === 0) {
      return {
        pagesCount: 0,
        page: Number(pageNumber),
        pageSize: convertedPageSize,
        totalCount: 0,
        items: [],
      };
    }

    const { userLikeMap, likesInfoMap } = await this.likesInfoService.getLikesInfoAll(userId, commentIds)

    return {
      pagesCount: Math.ceil(totalCount / convertedPageSize),
      page: Number(pageNumber),
      pageSize: convertedPageSize,
      totalCount: totalCount,
      items: comments.map(c => {
        const likesInfo = likesInfoMap.get(c._id.toString()) ?? { likesCount: 0, dislikesCount: 0 }
        const userLikeStatus = userLikeMap.get(c._id.toString()) ?? LikeType.None
        return commentMapper.mapCommentToOutputType(c, { ...likesInfo, myStatus: userLikeStatus } )
      })
    };
  }
}

