import {
  InputPostType,
  OutputPostType,
  OutputPostTypeWithInfo,
  PostType,
  UpdatePostType,
} from '../input-output-types/post-types';
import { PostDbType } from '../db/post-db.type';
import { postCollection } from '../db/mongoDb';
import { ObjectId, WithId } from 'mongodb';
import { GetAllQueryParams } from '../shared/types';

export const postRepository = {
  async create(input: InputPostType & { blogName: string }): Promise<string> {
    const result = await postCollection.insertOne(input);
    return result.insertedId.toString();
  },
  async update({ postId, update }: UpdatePostType): Promise<boolean> {
    const result = await postCollection.updateOne({ _id: new ObjectId(postId) }, { $set: update });
    return result.matchedCount === 1;
  },
  async findAll(inputFilter: GetAllQueryParams<PostType>): Promise<OutputPostTypeWithInfo> {
    const { sortDirection, sortBy, pageSize, pageNumber, searchNameTerm } = inputFilter;
    const filter = searchNameTerm ? { name: { $regex: searchNameTerm, $options: 'i' } } : {};

    const skip = (inputFilter.pageNumber - 1) * inputFilter.pageSize;

    // Execute queries in parallel for better performance
    const [totalCount, posts]: [number, WithId<PostDbType>[]] = await Promise.all([
      postCollection.countDocuments(filter), // Fetch total count
      postCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
    ]);

    return {
      pagesCount: Math.ceil(totalCount ?? 0 / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: totalCount,
      items: posts.map(this.mapToOutputType),
    };
  },
  async findById(id: string): Promise<OutputPostType | null> {
    const post = await postCollection.findOne({ _id: new ObjectId(id) });
    return post === null ? null : this.mapToOutputType(post);
  },
  async findByBlogId(id: string, inputFilter: GetAllQueryParams<PostType>): Promise<OutputPostTypeWithInfo> {
    const { sortDirection, sortBy, pageSize, pageNumber, searchNameTerm } = inputFilter;
    const filter = searchNameTerm ? { blogId: id, name: { $regex: searchNameTerm, $options: 'i' } } : { blogId: id };

    const skip = (inputFilter.pageNumber - 1) * inputFilter.pageSize;

    // Execute queries in parallel for better performance
    const [totalCount, posts]: [number, WithId<PostDbType>[]] = await Promise.all([
      postCollection.countDocuments(filter), // Fetch total count
      postCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
    ]);

    return {
      pagesCount: Math.ceil(totalCount ?? 0 / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: totalCount,
      items: posts.map(this.mapToOutputType),
    };
  },
  async deleteById(id: string): Promise<boolean> {
    const result = await postCollection.deleteOne({ _id: new ObjectId(id) });
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
