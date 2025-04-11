import { Resolutions } from '../src/input-output-types/video-types';
import { VideoDBType } from '../src/db/video-db-type';
import { generateId, generateIdString } from '../src/shared/utils';
import { PostDbType } from '../src/db/post-db.type';
import { BlogDbType } from '../src/db/blog-db-type';
import { ObjectId, WithId } from 'mongodb';
import { UserDbType } from '../src/db/user-db-type';

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
  login: ('n' + Date.now() + Math.random()).slice(0, 5),
  email: 'some@email.com',
  password: ('n' + Date.now() + Math.random()).slice(0, 5),
  createdAt: new Date(),
};
