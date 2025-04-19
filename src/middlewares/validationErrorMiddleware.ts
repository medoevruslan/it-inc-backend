import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ErrorMessageType } from '../input-output-types/output-errors-type';
import { FieldValidationError } from 'express-validator/lib/base';
import { HttpStatuses } from '../shared/enums';

export const validationErrorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mappedErrors = mapExpressErrorToCustom(errors.array({ onlyFirstError: true }) as FieldValidationError[]);
    res.status(HttpStatuses.BadRequest).json({ errorsMessages: mappedErrors });
    return;
  }
  next();
};

const mapExpressErrorToCustom = (errors: FieldValidationError[]): ErrorMessageType[] => {
  return errors.map((err) => ({ field: (err as FieldValidationError)?.path || 'unknown', message: err.msg }));
};
