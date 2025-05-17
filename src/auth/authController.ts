import { Request, Response } from 'express';
import { InputLoginType } from '../input-output-types/auth-types';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { userQueryRepository } from '../repository/userQueryRepository';
import { handleApiError } from '../shared/utils';
import { InputUserType } from '../input-output-types/user-types';
import { authService } from '../composition-root';

const login = async (req: Request<{}, {}, InputLoginType>, res: Response) => {
  try {
    const result = await authService.login(req.body);

    if (result.status !== ResultStatus.Success) {
      res.status(HttpStatuses.Unauthorized).send({ errorMessages: result.extensions });
      return;
    }

    res.status(HttpStatuses.Success).send(result.data);
  } catch (err) {
    handleApiError(err, res);
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
    handleApiError(err, res);
  }
};

const registration = async (req: Request<{}, {}, InputUserType>, res: Response) => {
  try {
    const result = await authService.register(req.body);
    res.status(HttpStatuses.Success).send(result);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};

const registrationConfirmation = async (req: Request<{}, {}, { code: string }>, res: Response) => {
  try {
    const result = await authService.registrationConfirm(req.body.code);
    if (result.status !== ResultStatus.Success) {
      res.status(result.status).send({ errorMessages: result.extensions });
    }
    res.sendStatus(204);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};

const registrationEmailResend = async (req: Request<{}, {}, InputLoginType>, res: Response) => {
  try {
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};

export const authController = {
  me,
  login,
  registration,
};
