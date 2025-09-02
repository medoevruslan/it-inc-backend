import { InputPostType, OutputPostType, PostType, UpdatePostType } from '../input-output-types/post-types';
import { PostDbType } from '../db/post-db.type';
import { ObjectId, WithId } from 'mongodb';
import { GetAllQueryParams, Nullable } from '../shared/types';
import { OutputModelTypeWithInfo } from '../input-output-types/common-types';
import { inject, injectable } from 'inversify';
import { PostModel } from '../model';
import { postMapper } from '../mapping/postMapper';
import { LikeInfoService } from '../service/LikeInfoService';
import { LikeType } from '../shared/enums';

@injectable()
export class PostRepository {

  constructor(@inject(LikeInfoService) protected likesInfoService: LikeInfoService) {
  }

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

  async findAll(inputFilter: GetAllQueryParams<PostType>, userId: string): Promise<OutputModelTypeWithInfo<OutputPostType>> {
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

    const postsIds = posts.map(p => p._id);

    const { likesInfoMap, userLikeMap } = await this.likesInfoService.getLikesInfoAll(userId, postsIds);

    return {
      pagesCount: Math.ceil(totalCount / convertedPageSize),
      page: Number(pageNumber),
      pageSize: convertedPageSize,
      totalCount: totalCount,
      items: posts.map(p => {
        const likesInfo = likesInfoMap.get(p._id.toString()) ?? { likesCount: 0, dislikesCount: 0 };
        const userLikeStatus = userLikeMap.get(p._id.toString()) ?? LikeType.None;
        const recentLikes = [...likesInfoMap.values()].map(info => ({ addedAt: info.addedAt, login: info.login, userId }))
        return postMapper.mapPostToOutputType(p, {
          ...likesInfo,
          myStatus: userLikeStatus,
          newestLikes: [...recentLikes.toSorted((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, 3)],
        });
      }),
    };
  }

  async findById(postId: string, userId: string): Promise<Nullable<OutputPostType>> {
    const post = await PostModel.findById(postId).lean();

    const { targetLikeInfo, newestLikes } = await this.likesInfoService.getLikesInfoSingle(userId, new ObjectId(postId));

    return post === null ? null : postMapper.mapPostToOutputType(post, { ...targetLikeInfo, newestLikes });
  }

  async findByBlogId(
    id: string,
    inputFilter: GetAllQueryParams<PostType>,
    userId: string,
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

    const postsIds = posts.map(p => p._id);

    const { likesInfoMap, userLikeMap } = await this.likesInfoService.getLikesInfoAll(userId, postsIds);

    return {
      pagesCount: Math.ceil(totalCount / convertedPageSize),
      page: Number(pageNumber),
      pageSize: convertedPageSize,
      totalCount: totalCount,
      items: posts.map(p => {
        const likesInfo = likesInfoMap.get(p._id.toString()) ?? { likesCount: 0, dislikesCount: 0 };
        const userLikeStatus = userLikeMap.get(p._id.toString()) ?? LikeType.None;
        const recentLikes = [...likesInfoMap.values()].map(info => ({ addedAt: info.addedAt, login: info.login, userId }))
        return postMapper.mapPostToOutputType(p, {
          ...likesInfo,
          myStatus: userLikeStatus,
          newestLikes: [...recentLikes.toSorted((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, 3)],
        });
      }),
    };
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await PostModel.findByIdAndDelete(id);
    return result !== null;
  }

}
