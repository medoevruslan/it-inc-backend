import { InputPostType, OutputPostType, PostType, UpdatePostType } from '../input-output-types/post-types';
import { ObjectId } from 'mongodb';
import { GetAllQueryParams, Result } from '../shared/types';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';
import { HttpStatuses, LikeType, ResultStatus } from '../shared/enums';
import { BlogRepository } from '../repository/BlogRepository';
import { PostRepository } from '../repository/PostRepository';
import { inject, injectable } from 'inversify';
import { LikeInfoService } from './LikeInfoService';
import { LikesInfoRepository } from '../repository/LikesInfoRepository';

@injectable()
export class PostService {

  constructor(
    @inject(BlogRepository) protected blogRepository: BlogRepository,
    @inject(PostRepository) protected postRepository: PostRepository,
    @inject(LikesInfoRepository) protected likesInfoRepository: LikesInfoRepository,
  ) {
  }

  async create(input: InputPostType, userId: string): Promise<OutputPostType> {
    const foundBlog = await this.blogRepository.findById(input.blogId);

    if (!foundBlog) {
      throw new Error(HttpStatuses.NotFound.toString());
    }

    const createdId = await this.postRepository.create({
      ...input,
      blogName: foundBlog.name,
      createdAt: new Date().toISOString(),
    });

    const createdPost = await this.postRepository.findById(createdId, userId);

    if (!createdPost) {
      throw new Error(HttpStatuses.ServerError.toString());
    }

    return createdPost;
  }

  async update({ postId, update }: UpdatePostType): Promise<boolean> {
    if (!ObjectId.isValid(postId)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const success = await this.postRepository.update({ postId, update });

    if (!success) {
      throw new Error(HttpStatuses.NotFound.toString());
    }
    return success;
  }

  async findAll(filter: GetAllQueryParams<PostType>, userId: string): Promise<OutputModelTypeWithInfo<OutputPostType>> {
    return this.postRepository.findAll(filter, userId);
  }

  async findById(id: string, userId: string): Promise<OutputPostType> {
    if (!ObjectId.isValid(id)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const found = await this.postRepository.findById(id, userId);

    if (!found) {
      console.log(`post ${id} not found`);
      throw new Error(HttpStatuses.NotFound.toString());
    }

    return found;
  }

  async deleteById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const success = await this.postRepository.deleteById(id);

    if (!success) {
      throw new Error(HttpStatuses.NotFound.toString());
    }

    return success;
  }

  public async updateLikeStatus(userId: string, postId: string, likeStatus: LikeType): Promise<Result> {
    if (!ObjectId.isValid(postId)) {
      console.log('post id is not valid on updateLikeStatus');
      throw new Error(ResultStatus.BadRequest.toString());
    }

    if (!Object.values(LikeType).includes(likeStatus)) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [{ field: 'likeStatus', message: 'Bad like status' }],
        errorMessage: 'Bad likeStatus',
        data: null,
      };
    }

    const foundPost = await this.postRepository.findById(postId, userId);
    if (!foundPost) {
      throw new Error(ResultStatus.NotFound.toString());
    }

    await this.likesInfoRepository.add({ parentId: postId, authorId: userId, myStatus: likeStatus });

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null,
    };
  }

}

