import { Request, Response } from 'express';
import { userService } from '../service/userService';
import { userQueryRepository } from '../repository/userQueryRepository';
import { GetAllUsersQueryParams } from '../input-output-types/user-types';
export const getUsersController = async (req: Request<{}, {}, {}, GetAllUsersQueryParams>, res: Response) => {
  try {
    console.log('usersInfo request query:: ', req.query);
    const usersInfo = await userQueryRepository.findAll(req.query);
    console.log('usersInfo:: ', usersInfo);
    res.send(usersInfo);
  } catch (err) {
    const error = err as Error;
    const errorCode = Number(error.message);
    if (isFinite(errorCode)) {
      res.status(errorCode).send();
    } else {
      res.status(500).send(error.message);
    }
  }
};
