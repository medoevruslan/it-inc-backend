import { Request, Response } from 'express';
import { db } from '../db/mongoDb';

export const clearDatabaseController = async (req: Request, res: Response) => {
  await db.dropCollections();
  console.log('clear database')
  res.status(204).send();
};
