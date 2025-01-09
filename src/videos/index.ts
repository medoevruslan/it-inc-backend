import { Router } from 'express';
import { getVideosController } from './getVideosController';
import { createVideoController } from './createVideoController';
import { findVideoController } from './findVideoController';
import { deleteVideoController } from './deleteVideoController';
import { updateVideoController } from './updateVideoController';

export const videosRouter = Router();

videosRouter.get('/', getVideosController);
videosRouter.post('/', createVideoController);
videosRouter.put('/:id', updateVideoController);
videosRouter.get('/:id', findVideoController);
videosRouter.delete('/:id', deleteVideoController);
