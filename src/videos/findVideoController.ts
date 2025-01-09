import { Request, Response } from 'express';
import { db } from '../db/db';
import { OutputVideoType } from '../input-output-types/video-types';

export const findVideoController = (req: Request<{ id: string }>, res: Response<OutputVideoType>) => {
  const videoId = req.params.id;

  const foundVideo = db.videos.find((video) => video.id === Number(videoId));

  if (!foundVideo) {
    res.status(404).send();
    return;
  }

  res.send(foundVideo);
};
