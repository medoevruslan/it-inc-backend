import { db } from '../db/mongoDb';
import { ObjectId, WithId } from 'mongodb';
import { HttpStatuses } from '../shared/enums';
import { commentMapper } from '../mapping/commentMapper';
import { GetAllQueryParamNoSearchTerm } from '../shared/types';
import { CommentType } from '../input-output-types/comment-types';
import { CommentDbType } from '../db/comment-db-type';

export const commentQueryRepository = {
  async findAll() {
    const foundComments = await db.getCollections().commentsCollection.find().toArray();
    return foundComments.map(commentMapper.mapCommentToOutputType);
  },
  async findById(commentId: string) {
    if (!ObjectId.isValid(commentId)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const foundComment = await db.getCollections().commentsCollection.findOne({ _id: new ObjectId(commentId) });

    if (!foundComment) {
      throw new Error(HttpStatuses.NotFound.toString());
    }
    return commentMapper.mapCommentToOutputType(foundComment);
  },

};
