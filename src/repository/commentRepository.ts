import { db } from '../db/mongoDb';
import { ObjectId } from 'mongodb';

export const commentRepository = {
  async update(commentId: string) {
    const result = await db.getCollections().commentsCollection.updateOne({ _id: new ObjectId(commentId) }, {});
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
