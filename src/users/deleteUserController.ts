import { Request, Response } from 'express';
export const deleteUserController = (req: Request, res: Response) => {
  try {
    res.send('deleteUserController'); //some
  } catch (err) {}
};
