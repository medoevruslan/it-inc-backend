import { Request, Response } from 'express';
import { setDB } from './db';
export const clearDatabaseController = (req: Request, res: Response) => {
  setDB();
  res.status(204).send();
};
