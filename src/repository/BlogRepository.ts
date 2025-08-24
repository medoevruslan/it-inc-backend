import { BlogType, InputBlogType, OutputBlogType, UpdateBlogType } from '../input-output-types/blog-types';
import { WithId } from 'mongodb';
import { BlogDbType } from '../db/blog-db-type';
import { GetAllQueryParams } from '../shared/types';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';
import { injectable } from 'inversify';
import { BlogModel } from '../model/BlogModel';

@injectable()
export class BlogRepository {

  async create(input: InputBlogType): Promise<string> {
    const blogModel = new BlogModel(input)
    await blogModel.save()
    return blogModel._id.toString();
  }

  async update({ blogId, update }: UpdateBlogType): Promise<boolean> {
    const blogModel = await BlogModel.findById(blogId);
    if (!blogModel) return false
    Object.assign(blogModel, update)
    blogModel.save()
    return true
  }

  async findAll(inputFilter: GetAllQueryParams<BlogType>): Promise<OutputModelTypeWithInfo<OutputBlogType>> {
    const { sortDirection, sortBy, pageSize, pageNumber, searchNameTerm } = inputFilter;
    const filter = searchNameTerm ? { name: { $regex: searchNameTerm, $options: 'i' } } : {};

    const convertedPageSize = Number(pageSize);

    const skip = (Number(pageNumber) - 1) * convertedPageSize;

    // Execute queries in parallel for better performance
    const [totalCount, blogs]: [number, WithId<BlogDbType>[]] = await Promise.all([
      BlogModel.countDocuments(filter), // Fetch total count
      BlogModel.find(filter)
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
      items: blogs.map(this.mapToOutputType),
    };
  }

  async findById(id: string): Promise<OutputBlogType | null> {
    const blog = await BlogModel.findById(id).lean()
    return blog === null ? null : this.mapToOutputType(blog);
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await BlogModel.findByIdAndDelete(id)
    return result !== null;
  }


  private mapToOutputType(blog: BlogDbType): OutputBlogType {
    return {
      id: blog._id.toString(),
      name: blog.name,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

}
