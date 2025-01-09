import { config } from 'dotenv';
config(); // добавление переменных из файла .env в process.env

const BASE_URL = '/hometask_01/api';

export const SETTINGS = {
  PORT: process.env.PORT || 3003,
  PATH: {
    VIDEOS: `${BASE_URL}/videos`,
    TESTING: `${BASE_URL}/testing/all-data`,
  },
};
