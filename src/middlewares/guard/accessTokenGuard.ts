import { Request, Response, NextFunction } from 'express';
import { HttpStatuses } from '../../shared/enums';
import { jwtService } from '../../service/jwtService';

export const accessTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization || !req.userId) {
    return res.status(HttpStatuses.Unauthorized);
  }

  const [authType, token] = req.headers.authorization.split(' ');

  if (authType !== 'Bearer') {
    return res.status(HttpStatuses.Unauthorized);
  }

  const payload = await jwtService.verifyToken<{ userId: string }>(token);

  if (payload) {
    const { userId } = payload;
    req.userId = userId;

    return next();
  }

  res.sendStatus(HttpStatuses.Unauthorized);
};
