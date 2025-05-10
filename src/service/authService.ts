import { InputLoginType, InputRegistrationType } from '../input-output-types/auth-types';
import { userRepository } from '../repository/userRepository';
import bcrypt from 'bcrypt';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { Nullable, Result } from '../shared/types';
import { jwtService } from './jwtService';
import { emailAdapter } from '../adapters/emailAdapter';
import { InputUserType } from '../input-output-types/user-types';
import { userService } from './userService';

export const authService = {
  async login(input: InputLoginType): Promise<Result<Nullable<{ accessToken: string }>>> {
    const foundUser = await userRepository.findByLoginOrEmail(input.loginOrEmail);

    if (foundUser === null) {
      throw new Error(HttpStatuses.Unauthorized.toString());
    }

    const isValidPassword = await bcrypt.compare(input.password, foundUser.accountData.password);

    if (!isValidPassword) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [
          { field: 'email', message: 'login or password is incorrect' },
          { field: 'password', message: 'login or password is incorrect' },
        ],
        data: null,
      };
    }

    const accessToken = await jwtService.createToken(foundUser._id.toString());

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: { accessToken },
    };
  },

  async register(data: InputUserType) {
    const created = await userService.create(data);
    const result =  await emailAdapter.sendEmail('')
    return result;
  }
};
