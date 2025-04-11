import { InputPostType, OutputPostType, PostType, UpdatePostType } from '../input-output-types/post-types';
import { PostDbType } from '../db/post-db.type';
import { ObjectId, WithId } from 'mongodb';
import { GetAllQueryParams } from '../shared/types';
import { db } from '../db/mongoDb';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';

export const postRepository = {
  async create(input: InputPostType & { blogName: string }): Promise<string> {
    const result = await db.getCollections().postCollection.insertOne(input);
    return result.insertedId.toString();
  },
  async update({ postId, update }: UpdatePostType): Promise<boolean> {
    const result = await db.getCollections().postCollection.updateOne({ _id: new ObjectId(postId) }, { $set: update });
    return result.matchedCount === 1;
  },
  async findAll(inputFilter: GetAllQueryParams<PostType>): Promise<OutputModelTypeWithInfo<OutputPostType>> {
    const { sortDirection, sortBy, pageSize, pageNumber, searchNameTerm } = inputFilter;
    const filter = searchNameTerm ? { name: { $regex: searchNameTerm, $options: 'i' } } : {};

    const convertedPageSize = Number(pageSize);

    const skip = (Number(pageNumber) - 1) * convertedPageSize;

    // Execute queries in parallel for better performance
    const [totalCount, posts]: [number, WithId<PostDbType>[]] = await Promise.all([
      db.getCollections().postCollection.countDocuments(filter), // Fetch total count
      db
        .getCollections()
        .postCollection.find(filter)
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
      items: posts.map(this.mapToOutputType),
    };
  },
  async findById(id: string): Promise<OutputPostType | null> {
    const post = await db.getCollections().postCollection.findOne({ _id: new ObjectId(id) });
    return post === null ? null : this.mapToOutputType(post);
  },
  async findByBlogId(
    id: string,
    inputFilter: GetAllQueryParams<PostType>,
  ): Promise<OutputModelTypeWithInfo<OutputPostType>> {
    const { sortDirection, sortBy, pageSize, pageNumber, searchNameTerm } = inputFilter;
    const filter = searchNameTerm ? { blogId: id, name: { $regex: searchNameTerm, $options: 'i' } } : { blogId: id };

    const convertedPageSize = Number(pageSize);

    const skip = (Number(pageNumber) - 1) * convertedPageSize;

    // Execute queries in parallel for better performance
    const [totalCount, posts]: [number, WithId<PostDbType>[]] = await Promise.all([
      db.getCollections().postCollection.countDocuments(filter), // Fetch total count
      db
        .getCollections()
        .postCollection.find(filter)
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
      items: posts.map(this.mapToOutputType),
    };
  },
  async deleteById(id: string): Promise<boolean> {
    const result = await db.getCollections().postCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },
  mapToOutputType(post: PostDbType): OutputPostType {
    return {
      id: post._id.toString(),
      blogName: post.blogName,
      title: post.title,
      blogId: post.blogId,
      content: post.content,
      shortDescription: post.shortDescription,
      createdAt: post.createdAt,
    };
  },
};
