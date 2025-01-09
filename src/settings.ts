import { config } from 'dotenv';
config();

const BASE_URL = '/hometask_01/api';

export const SETTINGS = {
  PORT: process.env.PORT || 3003,
  PATH: {
    VIDEOS: `${BASE_URL}/videos`,
    TESTING: `${BASE_URL}/testing/all-data`,
  },
};
