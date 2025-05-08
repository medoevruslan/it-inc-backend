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
    return foundComment ? commentMapper.mapCommentToOutputType(foundComment) : null;
  },

  async findByPostId(postId: string, query: GetAllQueryParamNoSearchTerm<CommentType>) {
    if (!ObjectId.isValid(postId)) {
      console.log('post id is not valid on find by post id');
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const { sortDirection, sortBy, pageSize, pageNumber } = query;

    const convertedPageSize = Number(pageSize);

    const skip = (Number(pageNumber) - 1) * convertedPageSize;

    const [totalCount, comments]: [number, WithId<CommentDbType>[]] = await Promise.all([
      db.getCollections().commentsCollection.countDocuments(), // Fetch total count
      db
        .getCollections()
        .commentsCollection.find()
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
  },
};
