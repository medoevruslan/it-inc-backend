import { config } from 'dotenv';
import * as Process from 'process';
import { SignOptions } from 'jsonwebtoken';

config();

export const BASE_URL = '/ht_08/api';

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
  ACCESS_TOKEN_EXP_TIME: Process.env.ACCESS_EXP_TIME as SignOptions['expiresIn'],
  REFRESH_TOKEN_EXP_TIME: Process.env.REFRESH_EXP_TIME as SignOptions['expiresIn'],
  COOKIES_EXP_TIME: Number(Process.env.REFRESH_EXP_TIME) || 20,
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  },
};
