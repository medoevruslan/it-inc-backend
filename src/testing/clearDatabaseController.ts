import { Request, Response } from 'express';
import { db } from '../db/mongoDb';

export const clearDatabaseController = async (req: Request, res: Response) => {
  await db.dropCollections();
  res.status(204).send();
};
