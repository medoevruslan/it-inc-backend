import { Request, Response } from 'express';
export const getUsersController = (req: Request, res: Response) => {
  try {
    res.send('getUsersController');
  } catch (err) {}
};
