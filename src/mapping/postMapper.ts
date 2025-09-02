import { OutputPostType } from '../input-output-types/post-types';
import { PostDbType } from '../db/post-db.type';
import { ExtendedLikesInfo, LikesInfo } from '../input-output-types/likes-info';

export const postMapper = {
  mapPostToOutputType(post: PostDbType, extendedLikesInfo: ExtendedLikesInfo): OutputPostType {
    return {
      id: post._id.toString(),
      blogName: post.blogName,
      title: post.title,
      blogId: post.blogId,
      content: post.content,
      shortDescription: post.shortDescription,
      createdAt: post.createdAt,
      extendedLikesInfo
    };
  },
};
