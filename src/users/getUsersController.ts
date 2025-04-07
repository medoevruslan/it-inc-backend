import { Request, Response } from 'express';
import { userService } from '../service/userService';
import { userQueryRepository } from '../repository/userQueryRepository';
export const getUsersController = async (req: Request, res: Response) => {
  try {
    const users = await userQueryRepository.findAll();
    res.send(users);
  } catch (err) {}
};
