import { VideoDBType } from './video-db-type';
import { PostDbType } from './post-db.type';
import { BlogDbType } from './blog-db-type';
import { UserDbType } from './user-db-type';
import { CommentDbType } from './comment-db-type';
import { TokenDbType } from './token-db-type';

export type DBType = {
  videos: VideoDBType[];
  posts: PostDbType[];
  blogs: BlogDbType[];
  users: UserDbType[];
  comments: CommentDbType[];
  refreshTokensBlocked: TokenDbType[];
  refreshTokensValid: TokenDbType[];
};

export const db: DBType = {
  videos: [],
  posts: [],
  blogs: [],
  users: [],
  comments: [],
  refreshTokensBlocked: [],
  refreshTokensValid: []
};

export const setDB = (dataset?: Partial<DBType>) => {
  if (!dataset) {
    db.videos = [];
    db.posts = [];
    db.blogs = [];
    db.users = [];
    db.comments = [];
    db.refreshTokensBlocked = []
    db.refreshTokensValid = []
    return;
  }

  db.videos = dataset.videos || db.videos;
  db.posts = dataset.posts || db.posts;
  db.blogs = dataset.blogs || db.blogs;
  db.users = dataset.users || db.users;
  db.comments = dataset.comments || db.comments;
  db.refreshTokensBlocked = dataset.refreshTokensBlocked || db.refreshTokensBlocked
  db.refreshTokensValid = dataset.refreshTokensValid || db.refreshTokensValid
};
