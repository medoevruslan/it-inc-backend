import { Request, Response } from 'express';
import { db } from '../db/db';
import { OutputVideoType } from '../input-output-types/video-types';
import { OutputErrorsType } from '../input-output-types/output-errors-type';

export const findVideoController = (
  req: Request<{ id: string }>,
  res: Response<OutputVideoType | OutputErrorsType>,
) => {
  const videoId = parseFloat(req.params.id); // Safely parse the ID as an float

  if (isNaN(videoId)) {
    res.status(400).send({ errorsMessages: [{ message: 'Invalid video ID', field: '' }] });
    return;
  }

  const foundVideo = db.videos.find((video) => video.id === Number(videoId));

  if (!foundVideo) {
    res.status(404).send();
    return;
  }

  res.send(foundVideo);
};
