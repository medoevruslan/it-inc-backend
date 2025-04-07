import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
export const deleteUserController = (req: Request, res: Response) => {
  try {
    res.status(HttpStatuses.NoContent).send('deleteUserController'); //some
  } catch (err) {}
};
