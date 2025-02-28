import express from 'express';
import cors from 'cors';
import { SETTINGS } from './settings';
import { videosRouter } from './videos';
import { testingRouter } from './testing';
import { postsRouter } from './posts';
import { blogsRouter } from './blogs';

export const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  // shows project version
  res.status(200).json({ version: '1.0' });
});

app.use(SETTINGS.PATH.VIDEOS, videosRouter);
app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.TESTING, testingRouter);
