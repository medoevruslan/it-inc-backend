import {Resolutions} from "../input-output-types/video-types";
import {Nullable} from "../shared/types";

export type VideoDBType = {
  id: string,
  title: string,
  author: string,
  canBeDownloaded: boolean,
  minAgeRestriction: Nullable<number>,
  createdAt: string,
  publicationDate: string,
  availableResolutions: Nullable<Resolutions[]>
}

