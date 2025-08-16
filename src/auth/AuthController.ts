import { Request, Response } from 'express';
import { InputLoginType } from '../input-output-types/auth-types';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { handleApiError } from '../shared/utils';
import { InputUserType } from '../input-output-types/user-types';
import { SETTINGS } from '../settings';
import { add } from 'date-fns';
import { UserQueryRepository } from '../repository/UserQueryRepository';
import { inject } from 'inversify';
import { AuthService } from '../service/AuthService';

export class AuthController {

  constructor(@inject(AuthService) protected authService: AuthService, @inject(UserQueryRepository) protected userQueryRepository: UserQueryRepository) {
  }

  async login(req: Request<{}, {}, InputLoginType>, res: Response) {
    try {
      const ip = req.ip;
      const userAgent = req.header('user-agent');

      const result = await this.authService.login({ ...req.body, ip, userAgent });

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
  }

  async me(req: Request<{}, {}, InputLoginType>, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        res.sendStatus(HttpStatuses.Unauthorized);
        return;
      }

      const response = await this.userQueryRepository.findById(userId);

      if (!response) {
        res.sendStatus(HttpStatuses.NotFound);
        return;
      }

      res.status(HttpStatuses.Success).send({ email: response.email, login: response.login, userId: response.id });
    } catch (err) {
      handleApiError(err, res);
    }
  }

  async registration(req: Request<{}, {}, InputUserType>, res: Response) {
    try {
      const result = await this.authService.register(req.body);

      if (result.status !== ResultStatus.Success) {
        res.status(result.status).send({ errorsMessages: result.extensions });
        return;
      }

      res.sendStatus(HttpStatuses.NoContent);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async registrationConfirmation(req: Request<{}, {}, { code: string }>, res: Response) {
    try {
      const result = await this.authService.registrationConfirm(req.body.code);
      if (result.status !== ResultStatus.Success) {
        res.status(result.status).send({ errorsMessages: result.extensions });
        return;
      }
      res.sendStatus(HttpStatuses.NoContent);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  };

  async registrationEmailResend(req: Request<{}, {}, { email: string }>, res: Response) {
    try {
      const result = await this.authService.resendRegistrationCode(req.body.email);
      if (result.status != ResultStatus.Success) {
        res.status(result.status).send({ errorsMessages: result.extensions });
        return;
      }
      res.sendStatus(HttpStatuses.NoContent);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async passwordRecovery(req: Request<{}, {}, { email: string }>, res: Response) {
    try {
      const result = await this.authService.recoverPassword(req.body.email);
      if (result.status != ResultStatus.Success) {
        res.status(result.status).send({ errorsMessages: result.extensions });
        return;
      }
      res.sendStatus(HttpStatuses.NoContent);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async newPassword(req: Request<{}, {}, { newPassword: string, recoveryCode: string }>, res: Response) {
    try {
      const { newPassword, recoveryCode } = req.body
      const result = await this.authService.newPassword(newPassword, recoveryCode);
      if (result.status != ResultStatus.Success) {
        res.status(result.status).send({ errorsMessages: result.extensions });
        return;
      }
      res.sendStatus(HttpStatuses.NoContent);
    } catch (err: unknown) {
      handleApiError(err, res);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const result = await this.authService.logout(req.cookies.refreshToken);

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

  async refreshToken(req: Request, res: Response) {
    try {
      const result = await this.authService.refreshToken(req.cookies.refreshToken);

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
}


