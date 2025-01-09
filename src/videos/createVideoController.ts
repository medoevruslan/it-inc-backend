import { Response, Request } from 'express';
import { ErrorMessageType, OutputErrorsType } from '../input-output-types/output-errors-type';
import { db } from '../db/db';
import { InputVideoType, OutputVideoType, Resolutions } from '../input-output-types/video-types';
import { VideoDBType } from '../db/video-db-type';
import { addDayTo, generateId } from '../shared/utils';

const inputValidation = (video: InputVideoType) => {
  const errors: OutputErrorsType = {
    errorsMessages: [],
  };

  if (!video?.author || !video?.author?.trim().length) {
    errors.errorsMessages.push({
      message: 'required',
      field: 'author',
    });
  }

  if (!video?.title || !video?.title?.trim().length) {
    errors.errorsMessages.push({
      message: 'required',
      field: 'title',
    });
  }

  if (!Array.isArray(video?.availableResolutions) || video?.availableResolutions.find((p) => !Resolutions[p])) {
    errors.errorsMessages.push({
      message: 'error!!!!',
      field: 'availableResolution',
    });
  }
  return errors;
};

export const createVideoController = (
  req: Request<any, any, InputVideoType>,
  res: Response<OutputVideoType | ErrorMessageType>,
) => {
  const errors = inputValidation(req.body);
  if (errors.errorsMessages.length) {
    res.status(400).json(errors.errorsMessages.shift());
    return;
  }

  const createdAt = new Date();
  const pubDate = addDayTo(createdAt);

  const newVideo: VideoDBType = {
    title: req.body.title,
    author: req.body.author,
    minAgeRestriction: req.body?.minAgeRestriction ?? null,
    canBeDownloaded: Boolean(req.body?.canBeDownloaded),
    createdAt: createdAt.toISOString(),
    publicationDate: pubDate.toISOString(),
    availableResolutions: req.body.availableResolutions,
    id: generateId(),
  };

  db.videos = [...db.videos, newVideo];

  res.status(201).json(newVideo);
};
