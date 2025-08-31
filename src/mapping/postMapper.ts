import { CommentDbType } from '../db/comment-db-type';
import { CommentOutputType, LikesInfo } from '../input-output-types/comment-types';
import { OutputPostType } from '../input-output-types/post-types';
import { PostDbType } from '../db/post-db.type';

export const postMapper = {
  mapPostToOutputType(post: PostDbType): OutputPostType {
    return {
      id: post._id.toString(),
      blogName: post.blogName,
      title: post.title,
      blogId: post.blogId,
      content: post.content,
      shortDescription: post.shortDescription,
      createdAt: post.createdAt,
      // likesInfo
    };
  },
};
