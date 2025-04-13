import { config } from 'dotenv';
import * as Process from 'process';
import { SignOptions } from 'jsonwebtoken';
config();

const BASE_URL = '/ht_06/api';

export const SETTINGS = {
  PORT: process.env.PORT || 3003,
  PATH: {
    VIDEOS: `${BASE_URL}/videos`,
    BLOGS: `${BASE_URL}/blogs`,
    POSTS: `${BASE_URL}/posts`,
    USERS: `${BASE_URL}/users`,
    AUTH: `${BASE_URL}/auth`,
    COMMENTS: `${BASE_URL}/comments`,
    TESTING: `${BASE_URL}/testing/all-data`,
  },
  ADMIN_AUTH: 'admin:qwerty',
  MONGO_URL: Process.env.MONGO_URL || 'mongodb://localhost:27017',
  DATABASE: Process.env.DATABASE || 'test',
  JWT: Process.env.JWT_SECRET as string,
  TOKEN_EXP_TIME: Process.env.EXP_TIME as SignOptions['expiresIn'],
};
