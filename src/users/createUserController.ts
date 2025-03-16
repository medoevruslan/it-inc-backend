import { Request, Response } from 'express';
export const createUserController = (req: Request, res: Response) => {
  try {
    res.send('createUserController');
  } catch (err) {}
};
