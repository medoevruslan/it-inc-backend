import { DBType } from '../src/db/db';
import { Resolutions } from '../src/input-output-types/video-types';
import { VideoDBType } from '../src/db/video-db-type';
import { generateId } from '../src/shared/utils';

export const video1: VideoDBType = {
  id: generateId(),
  title: ('t' + Date.now() + Math.random()).slice(0, 5),
  author: ('a' + Date.now() + Math.random()).slice(0, 5),
  canBeDownloaded: true,
  minAgeRestriction: null,
  createdAt: new Date().toISOString(),
  publicationDate: new Date().toISOString(),
  availableResolutions: [Resolutions.P240],
};

export const dataset1: DBType = {
  videos: [video1],
};
