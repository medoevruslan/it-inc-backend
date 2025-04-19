import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { userService } from '../service/userService';
export const deleteUserController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    await userService.deleteById(req.params.id);
    res.sendStatus(HttpStatuses.NoContent);
  } catch (err) {
    const error = err as Error;
    const errorCode = Number(error.message);
    if (isFinite(errorCode)) {
      res.status(errorCode).send();
    } else {
      res.status(HttpStatuses.ServerError).send(error.message);
    }
  }
};
