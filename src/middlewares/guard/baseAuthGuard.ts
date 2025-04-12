import { Request, Response, NextFunction } from 'express';
import { SETTINGS } from '../../settings';

export const baseAuthGuard = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.header('Authorization');

  if (!auth) {
    res.status(401).send();
    return;
  }

  const buffer = Buffer.from(auth.slice(6), 'base64');
  const decodedAuth = buffer.toString('utf-8');

  if (decodedAuth !== SETTINGS.ADMIN_AUTH || auth.slice(0, 5) !== 'Basic') {
    res.status(401).send();
    return;
  }

  next();
};
