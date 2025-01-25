import { InputBlogType, OutputBlogType } from '../input-output-types/blog-types';
import { blogsCollection } from '../db/mongoDb';
import { ObjectId } from 'mongodb';
import { BlogDbType } from '../db/blog-db-type';

type UpdateBlogType = { blogId: string; update: InputBlogType };

export const blogRepository = {
  async create(input: InputBlogType): Promise<string> {
    const result = await blogsCollection.insertOne(input);
    return result.insertedId.toString();
  },
  async update({ blogId, update }: UpdateBlogType): Promise<boolean> {
    const result = await blogsCollection.updateOne({ _id: new ObjectId(blogId) }, { $set: { ...update } });
    return result.modifiedCount > 0;
  },
  async findAll(): Promise<OutputBlogType[]> {
    const blogs = await blogsCollection.find({}).toArray();
    if (!blogs.length) return [];
    return blogs.map(this.mapToOutputType);
  },
  async findById(id: string): Promise<OutputBlogType | null> {
    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
    return blog === null ? null : this.mapToOutputType(blog);
  },
  async deleteById(id: string): Promise<boolean> {
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
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
