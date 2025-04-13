import express from 'express';
import cors from 'cors';
import { SETTINGS } from './settings';
import { videosRouter } from './videos';
import { testingRouter } from './testing';
import { postsRouter } from './posts';
import { blogsRouter } from './blogs';
import { usersRouter } from './users';
import { authRouter } from './auth';

import { Request, Response, ErrorRequestHandler, NextFunction } from 'express';
import { commentsRouter } from './comments';

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
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);
app.use(SETTINGS.PATH.TESTING, testingRouter);

app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error:', err);
  res.status(500).send('Something broke!');
});
