import { Response, Request } from 'express';
import { db } from '../db/db';
export const deleteVideoController = (req: Request<{ id: string }>, res: Response) => {
  const videoId = req.params.id;

  const foundVideoIndex = db.videos.findIndex((video) => video.id === Number(videoId));

  if (foundVideoIndex < 0) {
    res.status(404).send();
    return;
  }

  db.videos.splice(foundVideoIndex, 1);
  res.status(204).send();
};
