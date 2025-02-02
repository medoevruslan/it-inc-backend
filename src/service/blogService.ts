import {
  InputBlogType,
  OutputBlogType,
  OutputBlogTypeWithInfo,
  UpdateBlogType,
} from '../input-output-types/blog-types';
import { ObjectId } from 'mongodb';
import { blogRepository, postRepository } from '../repository';
import { AllBlogsQueryParams } from '../blogs/getBlogsController';
import { OutputPostTypeWithInfo } from '../input-output-types/post-types';

export const blogService = {
  async create(input: InputBlogType): Promise<OutputBlogType> {
    const createdId = await blogRepository.create({
      ...input,
      createdAt: new Date().toISOString(),
      isMembership: false,
    });

    const createdBlog = await blogRepository.findById(createdId);

    if (createdBlog === null) {
      throw new Error('400');
    }

    return createdBlog;
  },
  async update({ blogId, update }: UpdateBlogType): Promise<boolean> {
    if (!ObjectId.isValid(blogId)) {
      throw new Error('400');
    }

    const success = await blogRepository.update({ blogId, update });

    if (!success) {
      throw new Error('404');
    }

    return success;
  },
  async findAll(filter: AllBlogsQueryParams): Promise<OutputBlogTypeWithInfo> {
    return blogRepository.findAll(filter);
  },
  async findById(id: string): Promise<OutputBlogType> {
    if (!ObjectId.isValid(id)) {
      throw new Error('400');
    }
    const found = await blogRepository.findById(id);

    if (found === null) {
      throw new Error('404');
    }

    return found;
  },
  async findPostsByBlogId(id: string, filter: AllBlogsQueryParams): Promise<OutputPostTypeWithInfo> {
    if (!ObjectId.isValid(id)) {
      throw new Error('400');
    }
    return await postRepository.findByBlogId(id, filter);
  },
  async deleteById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      throw new Error('400');
    }

    const success = await blogRepository.deleteById(id);

    if (!success) {
      throw new Error('404');
    }
    return success;
  },
};
