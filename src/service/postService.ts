import { InputPostType, OutputPostType, PostType, UpdatePostType } from '../input-output-types/post-types';
import { blogRepository, postRepository } from '../repository';
import { ObjectId } from 'mongodb';
import { GetAllQueryParams } from '../shared/types';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';

export const postService = {
  async create(input: InputPostType): Promise<OutputPostType> {
    const foundBlog = await blogRepository.findById(input.blogId);

    if (!foundBlog) {
      throw new Error('404');
    }

    const createdId = await postRepository.create({
      ...input,
      blogName: foundBlog.name,
      createdAt: new Date().toISOString(),
    });

    const createdPost = await postRepository.findById(createdId);

    if (!createdPost) {
      throw new Error('500');
    }

    return createdPost;
  },
  async update({ postId, update }: UpdatePostType): Promise<boolean> {
    if (!ObjectId.isValid(postId)) {
      throw new Error('400');
    }

    const success = await postRepository.update({ postId, update });

    if (!success) {
      throw new Error('404');
    }
    return success;
  },
  async findAll(filter: GetAllQueryParams<PostType>): Promise<OutputModelTypeWithInfo<OutputPostType>> {
    return postRepository.findAll(filter);
  },
  async findById(id: string): Promise<OutputPostType> {
    if (!ObjectId.isValid(id)) {
      throw new Error('400');
    }

    const found = await postRepository.findById(id);

    if (!found) {
      throw new Error('404');
    }

    return found;
  },
  async deleteById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      throw new Error('400');
    }

    const success = await postRepository.deleteById(id);

    if (!success) {
      throw new Error('404');
    }

    return success;
  },
};
