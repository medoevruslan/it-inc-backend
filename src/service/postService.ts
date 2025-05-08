import { InputPostType, OutputPostType, PostType, UpdatePostType } from '../input-output-types/post-types';
import { blogRepository, postRepository } from '../repository';
import { ObjectId } from 'mongodb';
import { GetAllQueryParams } from '../shared/types';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';
import { HttpStatuses } from '../shared/enums';
import { CommentInputType } from '../input-output-types/comment-types';

export const postService = {
  async create(input: InputPostType): Promise<OutputPostType> {
    const foundBlog = await blogRepository.findById(input.blogId);

    if (!foundBlog) {
      throw new Error(HttpStatuses.NotFound.toString());
    }

    const createdId = await postRepository.create({
      ...input,
      blogName: foundBlog.name,
      createdAt: new Date().toISOString(),
    });

    const createdPost = await postRepository.findById(createdId);

    if (!createdPost) {
      throw new Error(HttpStatuses.ServerError.toString());
    }

    return createdPost;
  },
  async update({ postId, update }: UpdatePostType): Promise<boolean> {
    if (!ObjectId.isValid(postId)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const success = await postRepository.update({ postId, update });

    if (!success) {
      throw new Error(HttpStatuses.NotFound.toString());
    }
    return success;
  },
  async findAll(filter: GetAllQueryParams<PostType>): Promise<OutputModelTypeWithInfo<OutputPostType>> {
    return postRepository.findAll(filter);
  },
  async findById(id: string): Promise<OutputPostType> {
    if (!ObjectId.isValid(id)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const found = await postRepository.findById(id);

    if (!found) {
      console.log(`post ${id} not found`);
      throw new Error(HttpStatuses.NotFound.toString());
    }

    return found;
  },
  async deleteById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const success = await postRepository.deleteById(id);

    if (!success) {
      throw new Error(HttpStatuses.NotFound.toString());
    }

    return success;
  },
};
