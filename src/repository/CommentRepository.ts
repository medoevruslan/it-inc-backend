import { db } from '../db/mongoDb';
import { ObjectId, WithId } from 'mongodb';
import { CommentType, CommentUpdateType } from '../input-output-types/comment-types';
import { CommentDbType } from '../db/comment-db-type';
import { GetAllQueryParamNoSearchTerm } from '../shared/types';
import { HttpStatuses } from '../shared/enums';
import { commentMapper } from '../mapping/commentMapper';
import { injectable } from 'inversify';

@injectable()
export class CommentRepository {

  async create(comment: CommentDbType) {
    const result = await db.getCollections().commentsCollection.insertOne({ ...comment });
    return result.insertedId.toString();
  }

  async update({ commentId, update }: CommentUpdateType) {
    const result = await db
      .getCollections()
      .commentsCollection.updateOne({ _id: new ObjectId(commentId) }, { $set: { ...update } });
    return result.matchedCount === 1;
  }

  async delete(commentId: string) {
    const result = await db.getCollections().commentsCollection.deleteOne({ _id: new ObjectId(commentId) });
    return result.deletedCount === 1;
  }

  async findAll() {
    return db.getCollections().commentsCollection.find().toArray();
  }

  async findById(commentId: string) {
    return db.getCollections().commentsCollection.findOne({ _id: new ObjectId(commentId) });
  }

  async findByPostId(postId: string, query: GetAllQueryParamNoSearchTerm<CommentType>) {
    if (!ObjectId.isValid(postId)) {
      console.log('post id is not valid on find by post id');
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const { sortDirection, sortBy, pageSize, pageNumber } = query;

    const convertedPageSize = Number(pageSize);

    const skip = (Number(pageNumber) - 1) * convertedPageSize;

    const [totalCount, comments]: [number, CommentDbType[]] = await Promise.all([
      db.getCollections().commentsCollection.countDocuments({ postId }), // Fetch total count
      db
        .getCollections()
        .commentsCollection.find({ postId })
        .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(convertedPageSize)
        .toArray(),
    ]);

    return {
      pagesCount: Math.ceil(totalCount / convertedPageSize),
      page: Number(pageNumber),
      pageSize: convertedPageSize,
      totalCount: totalCount,
      items: comments.map(commentMapper.mapCommentToOutputType),
    };
  }

}

