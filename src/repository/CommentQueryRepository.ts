import { ObjectId } from 'mongodb';
import { HttpStatuses } from '../shared/enums';
import { commentMapper } from '../mapping/commentMapper';
import { injectable } from 'inversify';
import { CommentModel } from '../model';

@injectable()
export class CommentQueryRepository {
  async findAll() {
    const comments = await CommentModel.find().lean()
    return comments.map(commentMapper.mapCommentToOutputType);
  }

  async findById(commentId: string) {
    if (!ObjectId.isValid(commentId)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    // const foundComment = await db.getCollections().commentsCollection.findOne({ _id: new ObjectId(commentId) });
    const foundComment = await CommentModel.findById(commentId).lean();

    if (!foundComment) {
      throw new Error(HttpStatuses.NotFound.toString());
    }
    return commentMapper.mapCommentToOutputType(foundComment);
  }

}
