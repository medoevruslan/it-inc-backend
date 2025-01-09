import { Request, Response } from 'express';
import { db } from '../db/db';
import { InputVideoType } from '../input-output-types/video-types';
import { OutputErrorsType } from '../input-output-types/output-errors-type';
import { inputValidation } from './createVideoController';

export const updateVideoController = (
  req: Request<{ id: string }, any, Partial<InputVideoType>>,
  res: Response<OutputErrorsType>,
) => {
  const errors = inputValidation(req.body);
  if (errors.errorsMessages.length) {
    res.status(400).send({ errorsMessages: errors.errorsMessages.slice(0, 1) });
    return;
  }

  const videoId = parseFloat(req.params.id); // Safely parse the ID as float

  if (isNaN(videoId)) {
    res.status(400).send({ errorsMessages: [{ message: 'Invalid video ID', field: '' }] });
    return;
  }

  const foundVideoIndex = db.videos.findIndex((video) => video.id === Number(videoId));

  if (foundVideoIndex < 0) {
    res.status(404).send();
    return;
  }

  const foundVideo = db.videos[foundVideoIndex];

  db.videos[foundVideoIndex] = { ...foundVideo, ...req.body };
  res.status(204).send();
};
