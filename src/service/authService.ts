import { InputLoginType } from '../input-output-types/auth-types';
import bcrypt from 'bcrypt';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { Result } from '../shared/types';
import { InputUserType } from '../input-output-types/user-types';
import { EmailManager } from '../managers/emailManager';
import { UserService } from './userService';
import { UserRepository } from '../repository/userRepository';
import { UserDbType } from '../db/user-db-type';
import { JwtService } from './jwtService';
import { v4 as uuidV4 } from 'uuid';
import { add } from 'date-fns';
import { RefreshTokenBlockedRepository } from '../repository/refreshTokenBlockedRepository';

export class AuthService {

  constructor(protected emailManager: EmailManager, protected userService: UserService, protected userRepository: UserRepository, protected jwtService: JwtService, protected refreshTokensBlockedRepository: RefreshTokenBlockedRepository) {
  }

  public async login(input: InputLoginType): Promise<Result<{ accessToken: string, refreshToken: string }>> {
    const foundUser = await this.userRepository.findByLoginOrEmail(input.loginOrEmail);

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

    const accessToken = await this.jwtService.createAccessToken(foundUser._id.toString());
    const refreshToken = await this.jwtService.createRefreshToken(foundUser._id.toString());

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: { accessToken, refreshToken },
    };
  }

  public async register(data: InputUserType): Promise<Result<UserDbType>> {
    const { login, password, email } = data;

    const userByEmail = await this.userRepository.findByLoginOrEmail(email);
    const userByLogin = await this.userRepository.findByLoginOrEmail(login);

    if (userByEmail || userByLogin) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'User already exists',
        extensions: [
          ...(userByEmail ? [{ field: 'email', message: 'Email should be unique' }] : []),
          ...(userByLogin ? [{ field: 'login', message: 'Login should be unique' }] : []),
        ],
        data: null,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: UserDbType = {
      accountData: {
        login,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      },
      emailConfirmation: {
        isConfirmed: false,
        confirmationCode: uuidV4(),
        expirationDate: add(new Date(), { hours: 1 }),
      },
    };

    const createdUserId = await this.userRepository.create(newUser);

    try {
      this.emailManager.sendEmailConfirmation({
        email: newUser.accountData.email,
        verificationCode: newUser.emailConfirmation.confirmationCode,
      });
    } catch (err) {
      console.error(`error on send email: ${err}`);
    }


    return {
      status: ResultStatus.Success,
      extensions: [],
      data: newUser,
    };
  }

  public async registrationConfirm(code: string): Promise<Result<boolean>> {
    const user = await this.userRepository.findByConfirmationCode(code);

    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'User is not found',
        extensions: [
          { field: 'code', message: 'code is incorrect' },
        ],
        data: false,
      };
    }

    if (user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'User is already confirmed',
        extensions: [
          { field: 'code', message: 'user is already confirmed' },
        ],
        data: false,
      };
    }

    if (user.emailConfirmation.expirationDate < new Date()) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Confirmation code has been expired',
        extensions: [
          { field: 'code', message: 'confirmation code has been expired' },
        ],
        data: false,
      };
    }

    const isUpdated = await this.userRepository.update(user._id.toString(), {
      emailConfirmation: {
        ...user.emailConfirmation,
        isConfirmed: true,
      },
    });

    if (!isUpdated) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Failed to confirm email due to a server error.',
        extensions: [],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: isUpdated,
    };
  }

  async resendRegistrationCode(email: string): Promise<Result<boolean>> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad email format',
        extensions: [{ field: 'email', message: 'Bad email format' }],
        data: null,
      };
    }

    const userByEmail = await this.userRepository.findByLoginOrEmail(email);

    if (!userByEmail) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'User not exists',
        extensions: [{ field: 'email', message: 'Email is not existing' }],
        data: null,
      };
    }

    if (userByEmail.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Email is already confirmed',
        extensions: [{ field: 'email', message: 'Email is already confirmed' }],
        data: null,
      };
    }

    const verificationCode = uuidV4();

    await this.userRepository.update(userByEmail?._id.toString(), {
      emailConfirmation: {
        confirmationCode: verificationCode,
        isConfirmed: false,
        expirationDate: add(new Date(), { hours: 1 }),
      },
    });

    try {
      this.emailManager.sendEmailConfirmation({
        email,
        verificationCode,
      });
    } catch (err) {
      console.error(`error on send email: ${err}`);
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: true,
    };
  }

  async logout(refreshToken: string): Promise<Result<boolean>> {
    const isBlakListed = await this.refreshTokensBlockedRepository.findByToken(refreshToken);

    if (isBlakListed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: `Token is in black list`,
        extensions: [{ field: 'token', message:  'Token is in black list'}],
        data: null,
      };
    }

    const result = await this.jwtService.verifyToken<{ userId: string }>(refreshToken)

    if (!result) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: `Token is not valid`,
        extensions: [{ field: 'token', message: 'Token is not valid' }],
        data: null,
      };
    }

    await this.refreshTokensBlockedRepository.add(refreshToken);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null,
    };
  }

  async refreshToken(currentToken: string): Promise<Result<{ refreshToken: string, accessToken: string }>> {
    const user = await this.jwtService.verifyToken<{ userId: string }>(currentToken);

    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: `Token is not valid`,
        extensions: [],
        data: null,
      };
    }

    const foundUser = await this.userRepository.findById(user.userId);

    if (!foundUser) {
      console.log(`There is no such user with id: ${user.userId}`)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: `Can't find user`,
        extensions: [],
        data: null,
      }
    }

    const result = await this.refreshTokensBlockedRepository.add(currentToken);

    if (!result) {
      return  {
        status: ResultStatus.BadRequest,
        errorMessage: `Token: ${currentToken} is in black list`,
        extensions: [],
        data: null,
      }
    }

    const accessToken = await this.jwtService.createAccessToken(user.userId);
    const refreshToken = await this.jwtService.createRefreshToken(user.userId);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: { accessToken, refreshToken },
    };
  }
}
