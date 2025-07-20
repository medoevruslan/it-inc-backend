import { Request, Response } from 'express';
import { InputLoginType } from '../input-output-types/auth-types';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { userQueryRepository } from '../repository/userQueryRepository';
import { handleApiError } from '../shared/utils';
import { InputUserType } from '../input-output-types/user-types';
import { authService } from '../composition-root';
import { SETTINGS } from '../settings';
import { add } from 'date-fns';

const login = async (req: Request<{}, {}, InputLoginType>, res: Response) => {
  try {
    const ip = req.ip;
    const userAgent = req.header('user-agent')

    const result = await authService.login({ ...req.body, ip, userAgent  });

    if (result.status !== ResultStatus.Success || !result.data) {
      res.status(HttpStatuses.Unauthorized).send({ errorsMessages: result.extensions });
      return;
    }

    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true,
      secure: true,
      expires: add(new Date(), { seconds: SETTINGS.COOKIES_EXP_TIME }),
    });

    const accessToken = result.data.accessToken;

    res.status(HttpStatuses.Success).send({ accessToken });
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

    if (result.status !== ResultStatus.Success) {
      res.status(result.status).send({ errorsMessages: result.extensions });
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};

const registrationConfirmation = async (req: Request<{}, {}, { code: string }>, res: Response) => {
  try {
    const result = await authService.registrationConfirm(req.body.code);
    if (result.status !== ResultStatus.Success) {
      res.status(result.status).send({ errorsMessages: result.extensions });
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};

const registrationEmailResend = async (req: Request<{}, {}, { email: string }>, res: Response) => {
  try {
    const result = await authService.resendRegistrationCode(req.body.email);
    if (result.status != ResultStatus.Success) {
      res.status(result.status).send({ errorsMessages: result.extensions });
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  } catch (err: unknown) {
    handleApiError(err, res);
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const result = await authService.logout(req.cookies.refreshToken);

    if (result.status !== ResultStatus.Success) {
      console.log('result.status !== ResultStatus.Success || !result.data >> ', result);
      res.status(HttpStatuses.Unauthorized).send({ errorsMessages: result.extensions });
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  } catch (err) {
    handleApiError(err, res);
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const result = await authService.refreshToken(req.cookies.refreshToken);

    if (result.status !== ResultStatus.Success || !result.data) {
      console.log('refreshToken bad result: ', result);
      res.status(HttpStatuses.Unauthorized).send({ errorsMessages: result.extensions });
      return;
    }

    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true,
      secure: true,
      expires: add(new Date(), { seconds: SETTINGS.COOKIES_EXP_TIME }),
    });

    const accessToken = result.data.accessToken;

    res.status(HttpStatuses.Success).send({ accessToken });
  } catch (err) {
    handleApiError(err, res);
  }
};

export const authController = {
  me,
  login, logout,
  registration,
  registrationConfirmation,
  registrationEmailResend,
  refreshToken
};
