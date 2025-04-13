import { VideoDBType } from './video-db-type';
import { PostDbType } from './post-db.type';
import { BlogDbType } from './blog-db-type';
import { UserDbType } from './user-db-type';
import { CommentDbType } from './comment-db-type';

export type DBType = {
  videos: VideoDBType[];
  posts: PostDbType[];
  blogs: BlogDbType[];
  users: UserDbType[];
  comments: CommentDbType[];
};

export const db: DBType = {
  videos: [],
  posts: [],
  blogs: [],
  users: [],
  comments: [],
};

export const setDB = (dataset?: Partial<DBType>) => {
  if (!dataset) {
    db.videos = [];
    db.posts = [];
    db.blogs = [];
    db.users = [];
    db.comments = [];
    return;
  }

  db.videos = dataset.videos || db.videos;
  db.posts = dataset.posts || db.posts;
  db.blogs = dataset.blogs || db.blogs;
  db.users = dataset.users || db.users;
  db.comments = dataset.comments || db.comments;
};
