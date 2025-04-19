import { db } from '../db/mongoDb';
import { ObjectId } from 'mongodb';
import { CommentUpdateType } from '../input-output-types/comment-types';

export const commentRepository = {
  async update({ commentId, update }: CommentUpdateType) {
    const result = await db
      .getCollections()
      .commentsCollection.updateOne({ _id: new ObjectId(commentId) }, { $set: { ...update } });
    return result.matchedCount === 1;
  },
  async delete(commentId: string) {
    const result = await db.getCollections().commentsCollection.deleteOne({ _id: new ObjectId(commentId) });
    return result.deletedCount === 1;
  },
  async findAll() {
    return db.getCollections().commentsCollection.find().toArray();
  },
  async findById(commentId: string) {
    return db.getCollections().commentsCollection.findOne({ _id: new ObjectId(commentId) });
  },
};
