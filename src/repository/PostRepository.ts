import { InputPostType, OutputPostType, PostType, UpdatePostType } from '../input-output-types/post-types';
import { PostDbType } from '../db/post-db.type';
import { ObjectId, WithId } from 'mongodb';
import { GetAllQueryParams } from '../shared/types';
import { db } from '../db/mongoDb';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';
import { injectable } from 'inversify';
import { PostModel } from '../model/PostModel';

@injectable()
export class PostRepository {

  async create(input: InputPostType & { blogName: string }): Promise<string> {
    const postModel = new PostModel(input);
    await postModel.save();
    return postModel._id.toString();
  }

  async update({ postId, update }: UpdatePostType): Promise<boolean> {
    const postModel = await PostModel.findById(postId);
    if (!postModel) return false;
    Object.assign(postModel, update);
    await postModel.save();
    return true;
  }

  async findAll(inputFilter: GetAllQueryParams<PostType>): Promise<OutputModelTypeWithInfo<OutputPostType>> {
    const { sortDirection, sortBy, pageSize, pageNumber, searchNameTerm } = inputFilter;
    const filter = searchNameTerm ? { title: { $regex: searchNameTerm, $options: 'i' } } : {};

    const convertedPageSize = Number(pageSize);

    const skip = (Number(pageNumber) - 1) * convertedPageSize;

    // Execute queries in parallel for better performance
    const [totalCount, posts]: [number, WithId<PostDbType>[]] = await Promise.all([
      PostModel.countDocuments(filter), // Fetch total count
      PostModel.find(filter)
        .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(convertedPageSize)
        .lean(),
    ]);

    return {
      pagesCount: Math.ceil(totalCount / convertedPageSize),
      page: Number(pageNumber),
      pageSize: convertedPageSize,
      totalCount: totalCount,
      items: posts.map(this.mapToOutputType),
    };
  }

  async findById(id: string): Promise<OutputPostType | null> {
    const post = await PostModel.findById(id).lean()
    return post === null ? null : this.mapToOutputType(post);
  }

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
      PostModel.countDocuments(filter), // Fetch total count
      PostModel.find(filter)
        .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(convertedPageSize)
        .lean(),
    ]);

    return {
      pagesCount: Math.ceil(totalCount / convertedPageSize),
      page: Number(pageNumber),
      pageSize: convertedPageSize,
      totalCount: totalCount,
      items: posts.map(this.mapToOutputType),
    };
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await PostModel.findByIdAndDelete(id);
    return result !== null;
  }

  private mapToOutputType(post: PostDbType): OutputPostType {
    return {
      id: post._id.toString(),
      blogName: post.blogName,
      title: post.title,
      blogId: post.blogId,
      content: post.content,
      shortDescription: post.shortDescription,
      createdAt: post.createdAt,
    };
  }

}
