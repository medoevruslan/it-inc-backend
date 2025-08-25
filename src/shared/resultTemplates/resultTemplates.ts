import { ResultStatus } from '../enums';
import { Result } from '../types';

export const RESULT = {
  CODE_EXPIRED: {
    status: ResultStatus.BadRequest,
    errorMessage: 'Recovery code has expired',
    extensions: [{ field: 'code', message: 'Recovery code has expired' }],
    data: false,
  } satisfies Result<boolean>,

  USER_IS_ALREADY_CONFIRMED: {
    status: ResultStatus.BadRequest,
    errorMessage: 'User is already confirmed',
    extensions: [
      { field: 'code', message: 'user is already confirmed' },
    ],
    data: null,
  } satisfies Result<boolean>,

  USER_NOT_FOUND_BY_EMAIL: {
    status: ResultStatus.Success,
    errorMessage: 'User not found',
    extensions: [{ field: 'email', message: 'Email is not existing' }],
    data: null,
  } satisfies Result,

  TOKEN_DATA_NOT_FOUND: {
    status: ResultStatus.ServerError,
    extensions: [{ field: 'token', message: 'could not find iat or exp date' }],
    data: null,
  } satisfies Result
};