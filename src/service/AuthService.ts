import { LoginServiceInput } from '../input-output-types/auth-types';
import bcrypt from 'bcrypt';
import { HttpStatuses, ResultStatus } from '../shared/enums';
import { Result } from '../shared/types';
import { InputUserType } from '../input-output-types/user-types';
import { EmailManager } from '../managers/EmailManager';
import { UserService } from './UserService';
import { UserRepository } from '../repository/UserRepository';
import { UserDbType } from '../db/user-db-type';
import { v4 as uuidV4 } from 'uuid';
import { add } from 'date-fns';
import { DeviceSessionsService } from './DeviceSessionsService';
import { JwtService } from './JwtService';
import { RefreshTokenBlockedRepository } from '../repository/RefreshTokenBlockedRepository';
import { inject, injectable } from 'inversify';

@injectable()
export class AuthService {

  constructor(
    @inject(EmailManager) protected emailManager: EmailManager,
    @inject(UserService) protected userService: UserService,
    @inject(UserRepository) protected userRepository: UserRepository,
    @inject(JwtService) protected jwtService: JwtService,
    @inject(RefreshTokenBlockedRepository) protected refreshTokensBlockedRepository: RefreshTokenBlockedRepository,
    @inject(DeviceSessionsService) protected deviceSessionsService: DeviceSessionsService,
  ) {
  }

  public async login(input: LoginServiceInput): Promise<Result<{ accessToken: string, refreshToken: string }>> {
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

    const deviceId = uuidV4();
    const userId = foundUser._id.toString();
    const userIp = input.ip ?? '-1';
    const deviceName = input.userAgent ?? 'default-client';

    const accessToken = await this.jwtService.createAccessToken(userId);
    const { token: refreshToken, tokenData } = await this.jwtService.createRefreshToken(deviceId);

    console.log(`New session: deviceId=${deviceId}, ip=${userIp}, userAgent=${deviceName}`);

    if (!tokenData?.iat || !tokenData.exp) {
      console.log('could not find iat or exp date ');
      return {
        status: ResultStatus.ServerError,
        extensions: [{ field: 'token', message: 'could not find iat or exp date ' }],
        data: null,
      };
    }

    await this.deviceSessionsService.create({
      deviceId,
      userId,
      iat: tokenData.iat,
      deviceName,
      ip: userIp,
      exp: tokenData.exp,
    });

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

    this.emailManager.sendEmailConfirmation({
      email: newUser.accountData.email,
      verificationCode: newUser.emailConfirmation.confirmationCode,
    }).catch(e => console.log(`have an error on register ${JSON.stringify(e)}`))

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

    this.emailManager.sendEmailConfirmation({
      email,
      verificationCode,
    })

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: true,
    };
  }

  async recoverPassword(email: string): Promise<Result<boolean>> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad email format',
        extensions: [{ field: 'email', message: 'Bad email format' }],
        data: null,
      };
    }

    const recoveryCode = uuidV4();

    this.emailManager.sendPasswordRecovery({
      email,
      recoveryCode,
    }).catch(e => console.log(`have an error on send password recovery ${JSON.stringify(e)}`))

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
        extensions: [{ field: 'token', message: 'Token is in black list' }],
        data: null,
      };
    }

    const tokenResult = await this.jwtService.verifyToken<{ deviceId: string, iat: number }>(refreshToken);

    if (!tokenResult) {
      console.log('Token verify bad result: ', tokenResult);
      return {
        status: ResultStatus.BadRequest,
        errorMessage: `Token is not valid`,
        extensions: [{ field: 'token', message: 'Token is not valid' }],
        data: null,
      };
    }

    await this.refreshTokensBlockedRepository.add(refreshToken);
    const isSessionDeleted = await this.deviceSessionsService.deleteSessionByDeviceId(tokenResult.deviceId);

    if (!isSessionDeleted) {
      console.log('Delete session failed');
      return {
        status: ResultStatus.ServerError,
        errorMessage: `Could not delete session for device: ${tokenResult.deviceId}`,
        extensions: [{ field: 'token', message: 'Token is not valid' }],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null,
    };
  }

  async refreshToken(refreshToken: string): Promise<Result<{ refreshToken: string, accessToken: string }>> {
    const tokenResult = await this.jwtService.verifyToken<{ deviceId: string, iat: number }>(refreshToken);

    if (!tokenResult) {
      console.log(`refreshToken token bad result: ${tokenResult}`);
      return {
        status: ResultStatus.BadRequest,
        errorMessage: `Token is not valid`,
        extensions: [{ field: 'token', message: 'Token is not valid' }],
        data: null,
      };
    }

    const deviceSessionResult = await this.deviceSessionsService.findSessionByDeviceIdAndIat(tokenResult.deviceId, tokenResult.iat);

    if (!deviceSessionResult.data) {
      console.log('There is no such deviceSession [deviceId:]', tokenResult.deviceId);
      return deviceSessionResult;
    }

    const refreshTokensBlockedResult = await this.refreshTokensBlockedRepository.add(refreshToken);

    if (!refreshTokensBlockedResult) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: `Token: ${refreshToken} is in black list`,
        extensions: [],
        data: null,
      };
    }

    const deviceId = deviceSessionResult.data.deviceId;
    const userId = deviceSessionResult.data.userId;
    const iat = deviceSessionResult.data.iat;

    const accessToken = await this.jwtService.createAccessToken(userId);
    const { token: newRefreshToken, tokenData } = await this.jwtService.createRefreshToken(deviceId);

    if (!tokenData?.iat || !tokenData.exp) {
      console.log('could not find iat or exp date ');
      return {
        status: ResultStatus.ServerError,
        extensions: [{ field: 'token', message: 'could not find iat or exp date ' }],
        data: null,
      };
    }

    const updatedDeviceSessionResult = await this.deviceSessionsService.update({
      deviceId,
      iat,
      iatUpdated: tokenData.iat,
      expUpdated: tokenData.exp,
    });

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: { accessToken, refreshToken: newRefreshToken },
    };
  }
}
