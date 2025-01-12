import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validationMiddleware = <BodyType>(req: Request<{}, BodyType>, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errorsMessages: errors.array({ onlyFirstError: true }) });
  }
  next();
};
