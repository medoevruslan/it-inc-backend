import { Response } from 'express';
import { HttpStatuses } from '../enums';

export const handleApiError = (err: unknown, res: Response) => {
  const error = err as Error;
  const errorCode = Number(error.message);
  if (isFinite(errorCode)) {
    res.status(errorCode).send();
  } else {
    res.status(HttpStatuses.ServerError).send(error.message);
  }
};
