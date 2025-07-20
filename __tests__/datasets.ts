import { Resolutions } from '../src/input-output-types/video-types';
import { VideoDBType } from '../src/db/video-db-type';
import { generateId, generateIdString } from '../src/shared/utils';
import { PostDbType } from '../src/db/post-db.type';
import { BlogDbType } from '../src/db/blog-db-type';
import { ObjectId, WithId } from 'mongodb';
import { UserDbType } from '../src/db/user-db-type';
import { CommentDbType } from '../src/db/comment-db-type';
import { v4 as uuidV4 } from 'uuid'
import { TokenDbType } from '../src/db/token-db-type';

export const video1: VideoDBType = {
  id: generateId(),
  title: ('t' + Date.now() + Math.random()).slice(0, 5),
  author: ('a' + Date.now() + Math.random()).slice(0, 5),
  canBeDownloaded: true,
  minAgeRestriction: null,
  createdAt: new Date().toISOString(),
  publicationDate: new Date().toISOString(),
  availableResolutions: [Resolutions.P240],
};

export const post1: PostDbType = {
  _id: new ObjectId(),
  title: ('t' + Date.now() + Math.random()).slice(0, 5),
  shortDescription: ('sd' + Date.now() + Math.random()).slice(0, 5),
  content: ('c' + Date.now() + Math.random()).slice(0, 5),
  blogName: ('bn' + Date.now() + Math.random()).slice(0, 5),
  blogId: generateIdString(),
  createdAt: new Date().toISOString(),
};

export const blog1: BlogDbType = {
  _id: new ObjectId(),
  name: ('n' + Date.now() + Math.random()).slice(0, 5),
  description: ('d' + Date.now() + Math.random()).slice(0, 5),
  websiteUrl: 'https://some.com',
  createdAt: new Date().toISOString(),
  isMembership: false,
};

export const user1: WithId<UserDbType> = {
  _id: new ObjectId(),
  accountData: {
    login: ('n' + Date.now() + Math.random()).slice(0, 5),
    email: 'some@email.com',
    password: ('n' + Date.now() + Math.random()).slice(0, 5),
    createdAt: new Date(),
  },
  emailConfirmation: {
    isConfirmed: false,
    expirationDate: new Date(),
    confirmationCode: uuidV4()
  },
};

export const comment1: WithId<CommentDbType> = {
  _id: new ObjectId(),
  commentatorInfo: { userId: new ObjectId().toString(), userLogin: 'some_login' },
  content: 'some'.repeat(10),
  createdAt: new Date(),
  postId: new ObjectId().toString(),
};

export const refreshToken1: WithId<TokenDbType> = {
  _id: new ObjectId(),
  token: uuidV4()
}

export function getRandomLogin(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('');
}
