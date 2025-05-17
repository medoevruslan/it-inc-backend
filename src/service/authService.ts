import { InputLoginType } from '../input-output-types/auth-types';
import { userRepository } from '../repository/userRepository';
import bcrypt from 'bcrypt';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { Result } from '../shared/types';
import { jwtService } from './jwtService';
import { InputUserType } from '../input-output-types/user-types';
import { userService } from './userService';
import { emailManager } from '../managers/emailManager';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const authService = {
  async login(input: InputLoginType): Promise<Result<{ accessToken: string }>> {
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

  async register(data: InputUserType): Promise<Result<SMTPTransport.SentMessageInfo>> {
    const created = await userService.create(data);
    if (created.success && created.value) {
      const user = created.value;
      const result = await emailManager.sendEmailConfirmation({
        email: user.accountData.email,
        verificationCode: user.emailConfirmation.confirmationCode,
      });
      return {
        status: ResultStatus.Success,
        extensions: [],
        data: result
      };
    }

    return {
      status: ResultStatus.BadRequest,
      extensions: [],
      data: null
    };
  },

  async registrationConfirm(code: string): Promise<Result<boolean>> {
    const user = await userRepository.findByConfirmationCode(code);

    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [
          { field: 'code', message: 'code is incorrect' },
        ],
        data: null,
      }
    }

    if (user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [
          { field: 'code', message: 'user is already confirmed' },
        ],
        data: null,
      }
    }

    if (user.emailConfirmation.expirationDate < new Date()) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        extensions: [
          { field: 'code', message: 'confirmation code has been expired' },
        ],
        data: null,
      }
    }

    const isUpdated = await userRepository.update(user._id.toString(), { emailConfirmation: { ...user.emailConfirmation, isConfirmed: true } })

    if (!isUpdated) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Failed to confirm email due to a server error.',
        extensions: [],
        data: null,
      }
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: isUpdated,
    };

  },
};
