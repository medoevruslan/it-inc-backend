import { Request, Response, NextFunction } from 'express';
import { HttpStatuses } from '../../shared/enums';
import { jwtService } from '../../service/jwtService';

export const accessTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const [authType, token] = req.headers.authorization.split(' ');

  if (authType !== 'Bearer') {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const payload = await jwtService.verifyToken<{ userId: string }>(token);

  if (payload) {
    const { userId } = payload;
    req.userId = userId;

    next();
    return;
  }

  res.sendStatus(HttpStatuses.Unauthorized);
};
