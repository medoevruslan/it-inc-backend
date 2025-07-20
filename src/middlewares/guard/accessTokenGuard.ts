import { Request, Response, NextFunction } from 'express';
import { HttpStatuses } from '../../shared/enums';
import { jwtService } from '../../composition-root';

export const accessTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const [authType, token] = req.headers.authorization.split(' ');

  if (authType !== 'Bearer') {
    res.sendStatus(HttpStatuses.Unauthorized);
    console.log('accessTokenGuard: no Bearer token found')
    return;
  }

  const payload = await jwtService.verifyToken<{ userId: string }>(token);

  if (payload) {
    const { userId } = payload;
    req.userId = userId;

    next();
    return;
  }

  console.log('accessTokenGuard: no payload from token found')
  res.sendStatus(HttpStatuses.Unauthorized);
};
