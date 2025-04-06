import { Request, Response } from 'express';
export const deleteUserController = (req: Request, res: Response) => {
  try {
    res.status(204).send('deleteUserController'); //some
  } catch (err) {}
};
