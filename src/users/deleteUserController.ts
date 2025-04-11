import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { userService } from '../service/userService';
export const deleteUserController = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.params.id;
    await userService.deleteById(req.params.id);
    res.status(HttpStatuses.NoContent).send();
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
