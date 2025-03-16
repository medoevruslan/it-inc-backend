import {
  BlogDbTypeWithoutId,
  BlogType,
  OutputBlogType,
  OutputBlogTypeWithInfo,
  UpdateBlogType,
} from '../input-output-types/blog-types';
import { blogsCollection } from '../db/mongoDb';
import { ObjectId, WithId } from 'mongodb';
import { BlogDbType } from '../db/blog-db-type';
import { GetAllQueryParams } from '../shared/types';

export const blogRepository = {
  async create(input: BlogDbTypeWithoutId): Promise<string> {
    const result = await blogsCollection.insertOne(input);
    return result.insertedId.toString();
  },
  async update({ blogId, update }: UpdateBlogType): Promise<boolean> {
    const result = await blogsCollection.updateOne({ _id: new ObjectId(blogId) }, { $set: { ...update } });
    return result.matchedCount === 1;
  },
  async findAll(inputFilter: GetAllQueryParams<BlogType>): Promise<OutputBlogTypeWithInfo> {
    const { sortDirection, sortBy, pageSize, pageNumber, searchNameTerm } = inputFilter;
    const filter = searchNameTerm ? { name: { $regex: searchNameTerm, $options: 'i' } } : {};

    const convertedPageSize = Number(pageSize);

    const skip = (Number(pageNumber) - 1) * convertedPageSize;

    // Execute queries in parallel for better performance
    const [totalCount, blogs]: [number, WithId<BlogDbType>[]] = await Promise.all([
      blogsCollection.countDocuments(filter), // Fetch total count
      blogsCollection
        .find(filter)
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
      items: blogs.map(this.mapToOutputType),
    };
  },
  async findById(id: string): Promise<OutputBlogType | null> {
    const filter = { _id: new ObjectId(id) };
    const blog = await blogsCollection.findOne(filter);
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
};
