import { config } from 'dotenv';
import * as Process from 'process';
config();

const BASE_URL = '/ht_02/api';

export const SETTINGS = {
  PORT: process.env.PORT || 3003,
  PATH: {
    VIDEOS: `${BASE_URL}/videos`,
    BLOGS: `${BASE_URL}/blogs`,
    POSTS: `${BASE_URL}/posts`,
    TESTING: `${BASE_URL}/testing/all-data`,
  },
  ADMIN_AUTH: 'admin:qwerty',
  MONGO_URL: Process.env.MONGO_URL || 'mongodb://localhost:27017',
  DATABASE: Process.env.DATABASE || 'test',
};
