import { Request, Response } from 'express';
import { authService } from '../service/authService';
import { InputLoginType, InputRegistrationType } from '../input-output-types/auth-types';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { userQueryRepository } from '../repository/userQueryRepository';
import { handleApiError } from '../shared/utils';

const login = async (req: Request<{}, {}, InputLoginType>, res: Response) => {
  try {
    const response = await authService.login(req.body);

    if (response.status !== ResultStatus.Success) {
      res.status(HttpStatuses.Unauthorized).send(response.extensions);
      return;
    }

    res.status(HttpStatuses.Success).send(response.data);
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

const registration = async (req: Request<{}, {}, InputRegistrationType>, res: Response) => {
  try {
    const result =  await authService.register(req.body);
    res.status(HttpStatuses.Success).send(result);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};

const registrationConfirmation = async (req: Request<{}, {}, InputLoginType>, res: Response) => {
  try {

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
  registration
};
