import { Response, Request } from 'express';
import { db } from '../db/db';
import { OutputErrorsType } from '../input-output-types/output-errors-type';
export const deleteVideoController = (req: Request<{ id: string }>, res: Response<OutputErrorsType>) => {
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

  db.videos.splice(foundVideoIndex, 1);
  res.status(204).send();
};
