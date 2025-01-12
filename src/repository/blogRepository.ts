import { InputBlogType, OutputBlogType } from '../input-output-types/blog-types';
import { db } from '../db/db';
import { generateIdString } from '../shared/utils';

type UpdateBlogType = { blogId: string; update: InputBlogType };

export const blogRepository = {
  async create(input: InputBlogType): Promise<OutputBlogType> {
    const newBlog = { id: generateIdString(), ...input };
    db.blogs.push(newBlog);
    return newBlog;
  },
  async update({ blogId, update }: UpdateBlogType): Promise<boolean> {
    const foundIndex = db.blogs.findIndex((blog) => blog.id === blogId);
    if (foundIndex < 0) {
      return false;
    }
    db.blogs[foundIndex] = { id: blogId, ...update };
    return true;
  },
  async findAll(): Promise<OutputBlogType[]> {
    return db.blogs;
  },
  async findById(id: string): Promise<OutputBlogType | null> {
    return db.blogs.find((blog) => blog.id === id) || null;
  },
  async deleteById(id: string): Promise<boolean> {
    const foundIndex = db.blogs.findIndex((blog) => blog.id === id);
    if (foundIndex < 0) {
      return false;
    }
    db.blogs.splice(foundIndex, 1);
    return true;
  },
};
