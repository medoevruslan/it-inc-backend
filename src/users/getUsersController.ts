import { Request, Response } from 'express';
import { userService } from '../service/userService';
export const getUsersController = async (req: Request, res: Response) => {
  try {
    const users = await userService.findAll();
    res.send(users);
  } catch (err) {}
};
