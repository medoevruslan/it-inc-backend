import { Request, Response } from 'express';
export const createUserController = (req: Request, res: Response) => {
  try {
    res.status(201).send('createUserController');
  } catch (err) {}
};
