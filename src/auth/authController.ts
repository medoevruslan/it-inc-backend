import { Request, Response } from 'express';
import { authService } from '../service/authService';
import { InputLoginType } from '../input-output-types/auth-types';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { userQueryRepository } from '../repository/userQueryRepository';

const login = async (req: Request<{}, {}, InputLoginType>, res: Response) => {
  try {
    const response = await authService.login(req.body);

    if (response.status !== ResultStatus.Success) {
      res.status(HttpStatuses.Unauthorized).send(response.extensions);
      return;
    }

    res.status(HttpStatuses.Success).send(response.data);
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

const me = async (req: Request<{}, {}, InputLoginType>, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }

    const response = await userQueryRepository.findById(userId);

    if (!response) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    res.status(HttpStatuses.Success).send({ email: response.email, login: response.login, userId: response.id });
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

export const authController = {
  me,
  login,
};
