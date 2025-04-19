import { db } from '../db/mongoDb';
import { ObjectId } from 'mongodb';
import { HttpStatuses } from '../shared/enums';
import { commentMapper } from '../mapping/commentMapper';

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
    return foundComment ? commentMapper.mapCommentToOutputType(foundComment) : null;
  },
};
