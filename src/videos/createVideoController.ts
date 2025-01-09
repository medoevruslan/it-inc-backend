import { Request, Response } from 'express';
import { OutputErrorsType } from '../input-output-types/output-errors-type';
import { db } from '../db/db';
import { InputVideoType, OutputVideoType, Resolutions } from '../input-output-types/video-types';
import { VideoDBType } from '../db/video-db-type';
import { addDayTo, generateId } from '../shared/utils';

const MAX_AUTHOR_LENGTH = 20;
const MAX_TITLE_LENGTH = 40;

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

  if (video.author.trim().length > MAX_AUTHOR_LENGTH) {
    errors.errorsMessages.push({
      message: 'author name should be equal or less than 20 chars',
      field: 'author',
    });
  }

  if (!video?.title || !video?.title?.trim().length) {
    errors.errorsMessages.push({
      message: 'required',
      field: 'title',
    });
  }

  if (video.title.trim().length > MAX_TITLE_LENGTH) {
    errors.errorsMessages.push({
      message: 'title should be equal or less than 40 chars',
      field: 'title',
    });
  }

  if (video?.minAgeRestriction && (video.minAgeRestriction < 1 || video.minAgeRestriction > 18)) {
    errors.errorsMessages.push({
      message: 'minAgeRestriction should be in range 1 to 18 include',
      field: 'minAgeRestriction',
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
  res: Response<OutputVideoType | OutputErrorsType>,
) => {
  const errors = inputValidation(req.body);
  if (errors.errorsMessages.length) {
    res.status(400).send({ errorsMessages: errors.errorsMessages.slice(0, 1) });
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
