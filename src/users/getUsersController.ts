import { Request, Response } from 'express';
import { userQueryRepository } from '../repository/userQueryRepository';
import { GetAllUsersQueryParams } from '../input-output-types/user-types';
import { handleApiError } from '../shared/utils';

export const getUsersController = async (req: Request<{}, {}, {}, GetAllUsersQueryParams>, res: Response) => {
  try {
    const usersInfo = await userQueryRepository.findAll(req.query);
    res.send(usersInfo);
  } catch (err) {
   handleApiError(err, res)
  }
};
