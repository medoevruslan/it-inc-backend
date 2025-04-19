import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { userService } from '../service/userService';
export const deleteUserController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    console.log('trigger delete user: ', req.params.id);
    await userService.deleteById(req.params.id);
    console.log(`user with ${req.params.id} is deleted`);
    res.sendStatus(HttpStatuses.NoContent);
  } catch (err) {
    console.log('error when delete user :: ', err);
    const error = err as Error;
    const errorCode = Number(error.message);
    if (isFinite(errorCode)) {
      res.status(errorCode).send();
    } else {
      res.status(HttpStatuses.ServerError).send(error.message);
    }
  }
};
