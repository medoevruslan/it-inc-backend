import { Request, Response } from 'express';
import { authService } from '../service/authService';
import { InputLoginType } from '../input-output-types/auth-types';
import { ResultStatus } from '../shared/enums';

export const loginController = async (req: Request<{}, {}, InputLoginType>, res: Response) => {
  try {
    const response = await authService.login(req.body);

    if (response.status !== ResultStatus.Success) {
      res.status(401).send(response.extensions);
      return;
    }

    res.status(204).send(response.data);
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
