import { VideoDBType } from './video-db-type';
import { PostDbType } from './post-db.type';
import { BlogDbType } from './blog-db-type';
import { UserDbType } from './user-db-type';

export type DBType = {
  videos: VideoDBType[];
  posts: PostDbType[];
  blogs: BlogDbType[];
  users: UserDbType[];
};

export const db: DBType = {
  videos: [],
  posts: [],
  blogs: [],
  users: [],
};

export const setDB = (dataset?: Partial<DBType>) => {
  if (!dataset) {
    db.videos = [];
    db.posts = [];
    db.blogs = [];
    db.users = [];
    return;
  }

  db.videos = dataset.videos || db.videos;
  db.posts = dataset.posts || db.posts;
  db.blogs = dataset.blogs || db.blogs;
  db.users = dataset.users || db.users;
};
