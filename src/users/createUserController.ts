import { Request, Response } from 'express';
import { HttpStatuses } from '../shared/enums';
import { userService } from '../service/userService';
import { InputUserType } from '../input-output-types/user-types';
import { userQueryRepository } from '../repository/userQueryRepository';
export const createUserController = async (req: Request<{}, {}, InputUserType>, res: Response) => {
  try {
    const created = await userService.create(req.body);
    if (!created.success && created.errors?.errorsMessages.length) {
      res.status(HttpStatuses.BadRequest).send(created.errors);
      return;
    }
    const createdUser = await userQueryRepository.findById(created.value!);
    res.status(HttpStatuses.Created).send(createdUser);
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
