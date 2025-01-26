import { Request, Response } from 'express';
import { setMongoDB } from '../db/mongoDb';

export const clearDatabaseController = async (req: Request, res: Response) => {
  await setMongoDB();
  res.status(204).send();
};
