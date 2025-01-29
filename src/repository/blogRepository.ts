import {
  BlogDbTypeWithoutId,
  InputBlogType,
  OutputBlogType,
  OutputBlogTypeWithInfo,
  UpdateBlogType,
} from '../input-output-types/blog-types';
import { blogsCollection } from '../db/mongoDb';
import { ObjectId, SortDirection, WithId } from 'mongodb';
import { BlogDbType } from '../db/blog-db-type';
import { AllBlogsQueryParams } from '../blogs/getBlogsController';

export const blogRepository = {
  async create(input: BlogDbTypeWithoutId): Promise<string> {
    const result = await blogsCollection.insertOne(input);
    return result.insertedId.toString();
  },
  async update({ blogId, update }: UpdateBlogType): Promise<boolean> {
    const result = await blogsCollection.updateOne({ _id: new ObjectId(blogId) }, { $set: { ...update } });
    return result.matchedCount === 1;
  },
  async findAll(inputFilter: AllBlogsQueryParams): Promise<OutputBlogTypeWithInfo> {
    const { sortDirection, sortBy, pageSize, pageNumber, searchNameTerm } = inputFilter;
    const filter = searchNameTerm ? { name: { $regex: searchNameTerm, $options: 'i' } } : {};

    const skip = (inputFilter.pageNumber - 1) * inputFilter.pageSize;

    // Execute queries in parallel for better performance
    const [totalCount, blogs]: [number, WithId<BlogDbType>[]] = await Promise.all([
      blogsCollection.countDocuments(filter), // Fetch total count
      blogsCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
    ]);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: blogs.map(this.mapToOutputType),
    };
  },
  async findById(id: string): Promise<OutputBlogType | null> {
    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
    return blog === null ? null : this.mapToOutputType(blog);
  },
  async deleteById(id: string): Promise<boolean> {
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },

  mapToOutputType(blog: BlogDbType): OutputBlogType {
    return {
      id: blog._id.toString(),
      name: blog.name,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  },

  mapToOutputTypeWithInfo() {},
};
